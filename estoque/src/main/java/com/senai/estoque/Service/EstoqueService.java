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

import java.util.List;

@Service
public class EstoqueService {

    private final EstoqueRepository estoqueRepository;
    private final ProdutoRepository produtoRepository;
    private final PosicaoRepository posicaoRepository;

    public EstoqueService(EstoqueRepository estoqueRepository,
                          ProdutoRepository produtoRepository,
                          PosicaoRepository posicaoRepository) {
        this.estoqueRepository = estoqueRepository;
        this.produtoRepository = produtoRepository;
        this.posicaoRepository = posicaoRepository;
    }

    public List<EstoqueDTO> listar() {
        return estoqueRepository.findAll().stream().map(this::toResponseDTO).toList();
    }

    public EstoqueDTO buscarPorId(Long id) {
        return estoqueRepository.findById(id)
                .map(this::toResponseDTO)
                .orElseThrow(() -> new EntityNotFoundException("Item de estoque não encontrado"));
    }

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
        return toResponseDTO(estoqueRepository.save(estoque));
    }

    public EstoqueDTO atualizar(Long id, EstoqueDTO dto) {
        Estoque estoque = estoqueRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Item de estoque não encontrado"));
        Produto produto = produtoRepository.findById(dto.produtoId())
                .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado"));
        Posicao posicao = posicaoRepository.findById(dto.posicaoId())
                .orElseThrow(() -> new EntityNotFoundException("Posição não encontrada"));
        estoque.setQuantidade(dto.quantidade());
        estoque.setProduto(produto);
        estoque.setPosicao(posicao);
        return toResponseDTO(estoqueRepository.save(estoque));
    }

    public void deletar(Long id) {
        if (!estoqueRepository.existsById(id)) {
            throw new EntityNotFoundException("Item de estoque não encontrado");
        }
        estoqueRepository.deleteById(id);
    }

    public List<EstoqueDTO> getByProduto(Long produtoId) {
        return estoqueRepository.findAllByProdutoId(produtoId)
                .stream().map(this::toResponseDTO).toList();
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