package com.senai.estoque.Service;

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

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MovimentacaoService {

    private final MovimentacaoRepository movimentacaoRepository;
    private final ProdutoRepository produtoRepository;
    private final PosicaoRepository posicaoRepository;
    private final DocaRepository docaRepository;

    public MovimentacaoService(MovimentacaoRepository movimentacaoRepository,
                               ProdutoRepository produtoRepository,
                               PosicaoRepository posicaoRepository,
                               DocaRepository docaRepository) {
        this.movimentacaoRepository = movimentacaoRepository;
        this.produtoRepository = produtoRepository;
        this.posicaoRepository = posicaoRepository;
        this.docaRepository = docaRepository;
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
        return toResponseDTO(movimentacaoRepository.save(mov));
    }

    public MovimentacaoDTO atualizar(Long id, MovimentacaoDTO dto) {
        Movimentacao mov = movimentacaoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Movimentação não encontrada"));
        montar(mov, dto);
        return toResponseDTO(movimentacaoRepository.save(mov));
    }

    public void deletar(Long id) {
        if (!movimentacaoRepository.existsById(id)) {
            throw new EntityNotFoundException("Movimentação não encontrada");
        }
        movimentacaoRepository.deleteById(id);
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
        return toResponseDTO(movimentacaoRepository.save(mov));
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

        mov.setSaida(dto.saida());
        mov.setDataHora(dto.dataHora() != null ? dto.dataHora() : LocalDateTime.now());
        mov.setQuantidade(dto.quantidade());
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