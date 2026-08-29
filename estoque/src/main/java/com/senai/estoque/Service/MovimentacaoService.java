package com.senai.estoque.Service;

import com.senai.estoque.DTO.EstoqueDTO;
import com.senai.estoque.DTO.MovimentacaoDTO;
import com.senai.estoque.database.model.Doca;
import com.senai.estoque.database.model.Movimentacao;
import com.senai.estoque.database.model.Posicao;
import com.senai.estoque.database.model.Produto;
import com.senai.estoque.database.repository.DocaRepository;
import com.senai.estoque.database.repository.MovimentacaoRepository;
import com.senai.estoque.database.repository.PosicaoRepository;
import com.senai.estoque.database.repository.ProdutoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class MovimentacaoService {

    private final MovimentacaoRepository movimentacaoRepository;
    private final ProdutoRepository produtoRepository;
    private final PosicaoRepository posicaoRepository;
    private final DocaRepository docaRepository;
    private final EstoqueService estoqueService;
    private final EventoService eventoService;

    public MovimentacaoService(MovimentacaoRepository movimentacaoRepository,
                               ProdutoRepository produtoRepository,
                               PosicaoRepository posicaoRepository,
                               DocaRepository docaRepository,
                               EstoqueService estoqueService,
                               EventoService eventoService) {
        this.movimentacaoRepository = movimentacaoRepository;
        this.produtoRepository = produtoRepository;
        this.posicaoRepository = posicaoRepository;
        this.docaRepository = docaRepository;
        this.estoqueService = estoqueService;
        this.eventoService = eventoService;
    }

    public List<MovimentacaoDTO> listar() {
        return movimentacaoRepository.findAll().stream().map(this::toResponseDTO).toList();
    }

    public MovimentacaoDTO buscarPorId(Long id) {
        return movimentacaoRepository.findById(id)
                .map(this::toResponseDTO)
                .orElseThrow(() -> new EntityNotFoundException("Movimentação não encontrada"));
    }

    public MovimentacaoDTO salvar(MovimentacaoDTO dto) {
        Movimentacao mov = montar(new Movimentacao(), dto);
        MovimentacaoDTO salva = toResponseDTO(movimentacaoRepository.save(mov));
        eventoService.publicar("movimentacao:created", salva);
        return salva;
    }

    public MovimentacaoDTO atualizar(Long id, MovimentacaoDTO dto) {
        Movimentacao mov = movimentacaoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Movimentação não encontrada"));
        montar(mov, dto);
        MovimentacaoDTO atualizada = toResponseDTO(movimentacaoRepository.save(mov));
        eventoService.publicar("movimentacao:updated", atualizada);
        return atualizada;
    }

    public void deletar(Long id) {
        if (!movimentacaoRepository.existsById(id)) {
            throw new EntityNotFoundException("Movimentação não encontrada");
        }
        movimentacaoRepository.deleteById(id);
        eventoService.publicar("movimentacao:removed", id);
    }

    public List<MovimentacaoDTO> getSaidasPendentes() {
        return movimentacaoRepository.findAllBySaidaTrueAndAutorizadaFalse()
                .stream().map(this::toResponseDTO).toList();
    }

    public List<MovimentacaoDTO> getByDoca(Long docaId) {
        return movimentacaoRepository.findAllByDocaId(docaId)
                .stream().map(this::toResponseDTO).toList();
    }

    public MovimentacaoDTO autorizarSaida(Long id) {
        Movimentacao mov = movimentacaoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Movimentação não encontrada"));
        mov.setAutorizada(true);
        mov.setLiberada(true);
        MovimentacaoDTO autorizada = toResponseDTO(movimentacaoRepository.save(mov));
        eventoService.publicar("movimentacao:autorizada", autorizada);
        return autorizada;
    }

    /**
     * Conferência física do item pelo operador no coletor.
     * A quantidade da nota é preservada; a divergência é a diferença entre as duas.
     */
    public MovimentacaoDTO conferirItem(Long id, BigDecimal quantidadeConferida) {
        if (quantidadeConferida == null || quantidadeConferida.signum() < 0) {
            throw new IllegalArgumentException("Quantidade conferida inválida");
        }
        Movimentacao mov = movimentacaoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Movimentação não encontrada"));
        mov.setQuantidadeConferida(quantidadeConferida);
        mov.setConferida(true);
        MovimentacaoDTO conferida = toResponseDTO(movimentacaoRepository.save(mov));
        eventoService.publicar("movimentacao:conferida", conferida);
        return conferida;
    }

    /**
     * Finaliza a conferência da nota e libera a doca vinculada.
     * É o que faz a doca voltar para "Livre" na Web no mesmo instante.
     */
    @Transactional
    public MovimentacaoDTO validarLiberarDoca(Long id) {
        Movimentacao mov = movimentacaoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Movimentação não encontrada"));
        mov.setAutorizada(true);
        mov.setLiberada(true);
        MovimentacaoDTO validada = toResponseDTO(movimentacaoRepository.save(mov));

        Doca doca = mov.getDoca();
        if (doca != null && Boolean.TRUE.equals(doca.getOcupada())) {
            doca.setOcupada(false);
            Doca salva = docaRepository.save(doca);
            eventoService.publicar("dock:released",
                    new com.senai.estoque.DTO.DocaDTO(
                            salva.getId(), salva.getNumero(), salva.getExpedicao(), salva.getOcupada()));
        }
        eventoService.publicar("movimentacao:autorizada", validada);
        return validada;
    }

    /**
     * Endereçamento manual do palete: cria o item de estoque na posição escolhida
     * e amarra a movimentação àquela posição.
     */
    @Transactional
    public MovimentacaoDTO enderecar(Long id, Long posicaoId, BigDecimal quantidade) {
        Movimentacao mov = movimentacaoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Movimentação não encontrada"));
        Posicao posicao = posicaoRepository.findById(posicaoId)
                .orElseThrow(() -> new EntityNotFoundException("Posição não encontrada"));
        if (Boolean.TRUE.equals(posicao.getOcupada())) {
            throw new IllegalStateException("Posição já ocupada");
        }

        // vale o que foi contado; se ninguém conferiu, vale o que a nota declarou
        BigDecimal qtd = quantidade != null ? quantidade
                : (mov.getQuantidadeConferida() != null ? mov.getQuantidadeConferida() : mov.getQuantidade());
        estoqueService.salvar(new EstoqueDTO(null, qtd, mov.getProduto().getId(), posicao.getId()));

        mov.setPosicao(posicao);
        MovimentacaoDTO enderecada = toResponseDTO(movimentacaoRepository.save(mov));
        eventoService.publicar("movimentacao:enderecada", enderecada);
        return enderecada;
    }

    private Movimentacao montar(Movimentacao mov, MovimentacaoDTO dto) {
        Produto produto = produtoRepository.findById(dto.produtoId())
                .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado"));

        Posicao posicao = dto.posicaoId() == null ? null :
                posicaoRepository.findById(dto.posicaoId())
                        .orElseThrow(() -> new EntityNotFoundException("Posição não encontrada"));
        Doca doca = dto.docaId() == null ? null :
                docaRepository.findById(dto.docaId())
                        .orElseThrow(() -> new EntityNotFoundException("Doca não encontrada"));
        if (doca != null && mov.getId() == null && Boolean.TRUE.equals(doca.getOcupada())) {
            throw new IllegalStateException("Doca já ocupada por outro caminhão");
        }

        mov.setSaida(dto.saida());
        mov.setDataHora(dto.dataHora() != null ? dto.dataHora() : LocalDateTime.now());
        mov.setQuantidade(dto.quantidade());
        mov.setQuantidadeConferida(dto.quantidadeConferida());
        mov.setConferida(dto.conferida() != null ? dto.conferida() : false);
        mov.setPlaca(dto.placa());
        mov.setMotorista(dto.motorista());
        mov.setTransportadora(dto.transportadora());
        mov.setNota(dto.nota());
        mov.setAutorizada(dto.autorizada() != null ? dto.autorizada() : false);
        mov.setLiberada(dto.liberada() != null ? dto.liberada() : false);
        mov.setProduto(produto);
        mov.setPosicao(posicao);
        mov.setDoca(doca);
        return mov;
    }

    private MovimentacaoDTO toResponseDTO(Movimentacao mov) {
        return new MovimentacaoDTO(
                mov.getId(),
                mov.getSaida(),
                mov.getDataHora(),
                mov.getQuantidade(),
                mov.getQuantidadeConferida(),
                mov.getConferida(),
                mov.getPlaca(),
                mov.getMotorista(),
                mov.getTransportadora(),
                mov.getNota(),
                mov.getAutorizada(),
                mov.getLiberada(),
                mov.getProduto().getId(),
                mov.getPosicao() != null ? mov.getPosicao().getId() : null,
                mov.getDoca() != null ? mov.getDoca().getId() : null
        );
    }
}
