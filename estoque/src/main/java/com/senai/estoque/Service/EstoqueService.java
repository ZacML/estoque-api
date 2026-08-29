package com.senai.estoque.Service;


import com.senai.estoque.DTO.EstoqueDTO;
import com.senai.estoque.database.model.Estoque;
import com.senai.estoque.database.model.Posicao;
import com.senai.estoque.database.model.Produto;
import com.senai.estoque.database.repository.EstoqueRepository;
import com.senai.estoque.database.repository.PosicaoRepository;
import com.senai.estoque.database.repository.ProdutoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EstoqueService {

    private final EstoqueRepository estoqueRepository;
    private final ProdutoRepository produtoRepository;
    private final PosicaoRepository posicaoRepository;
    private final EventoService eventoService;

    public EstoqueService(EstoqueRepository estoqueRepository,
                          ProdutoRepository produtoRepository,
                          PosicaoRepository posicaoRepository,
                          EventoService eventoService) {
        this.estoqueRepository = estoqueRepository;
        this.produtoRepository = produtoRepository;
        this.posicaoRepository = posicaoRepository;
        this.eventoService = eventoService;
    }

    public List<EstoqueDTO> listar() {
        return estoqueRepository.findAll().stream().map(this::toResponseDTO).toList();
    }

    public EstoqueDTO buscarPorId(Long id) {
        return estoqueRepository.findById(id)
                .map(this::toResponseDTO)
                .orElseThrow(() -> new EntityNotFoundException("Item de estoque não encontrado"));
    }

    @Transactional
    public EstoqueDTO salvar(EstoqueDTO dto) {
        Produto produto = produtoRepository.findById(dto.produtoId())
                .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado"));
        Posicao posicao = posicaoRepository.findById(dto.posicaoId())
                .orElseThrow(() -> new EntityNotFoundException("Posição não encontrada"));
        Estoque estoque = Estoque.builder()
                .quantidade(dto.quantidade())
                .produto(produto)
                .posicao(posicao)
                .build();
        EstoqueDTO salvo = toResponseDTO(estoqueRepository.save(estoque));

        // Guardar um palete ocupa a posição — é isso que muda a cor da rua no mapa Web.
        marcarPosicao(posicao, true);
        eventoService.publicar("pallet:stored", salvo);
        return salvo;
    }

    @Transactional
    public EstoqueDTO atualizar(Long id, EstoqueDTO dto) {
        Estoque estoque = estoqueRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Item de estoque não encontrado"));
        Produto produto = produtoRepository.findById(dto.produtoId())
                .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado"));
        Posicao posicao = posicaoRepository.findById(dto.posicaoId())
                .orElseThrow(() -> new EntityNotFoundException("Posição não encontrada"));

        Posicao anterior = estoque.getPosicao();
        estoque.setQuantidade(dto.quantidade());
        estoque.setProduto(produto);
        estoque.setPosicao(posicao);
        EstoqueDTO atualizado = toResponseDTO(estoqueRepository.save(estoque));

        if (anterior != null && !anterior.getId().equals(posicao.getId())) {
            liberarSeVazia(anterior);
        }
        marcarPosicao(posicao, true);
        eventoService.publicar("pallet:stored", atualizado);
        return atualizado;
    }

    @Transactional
    public void deletar(Long id) {
        Estoque estoque = estoqueRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Item de estoque não encontrado"));
        Posicao posicao = estoque.getPosicao();
        estoqueRepository.delete(estoque);
        liberarSeVazia(posicao);
        eventoService.publicar("estoque:removed", id);
    }

    public List<EstoqueDTO> getByProduto(Long produtoId) {
        return estoqueRepository.findAllByProdutoId(produtoId)
                .stream().map(this::toResponseDTO).toList();
    }

    public List<EstoqueDTO> getByPosicao(Long posicaoId) {
        return estoqueRepository.findAllByPosicaoId(posicaoId)
                .stream().map(this::toResponseDTO).toList();
    }

    /** Libera a posição somente quando não sobrou nenhum item de estoque nela. */
    private void liberarSeVazia(Posicao posicao) {
        if (posicao == null) return;
        if (estoqueRepository.findAllByPosicaoId(posicao.getId()).isEmpty()) {
            marcarPosicao(posicao, false);
        }
    }

    private void marcarPosicao(Posicao posicao, boolean ocupada) {
        if (posicao == null || Boolean.valueOf(ocupada).equals(posicao.getOcupada())) return;
        posicao.setOcupada(ocupada);
        Posicao salva = posicaoRepository.save(posicao);
        eventoService.publicar("street:occupancy_updated",
                new com.senai.estoque.DTO.PosicaoDTO(
                        salva.getId(), salva.getNumero(), salva.getOcupada(), salva.getRua().getId()));
    }

    private EstoqueDTO toResponseDTO(Estoque estoque) {
        return new EstoqueDTO(
                estoque.getId(),
                estoque.getQuantidade(),
                estoque.getProduto().getId(),
                estoque.getPosicao().getId()
        );
    }
}
