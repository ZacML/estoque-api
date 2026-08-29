package com.senai.estoque.Service;

import com.senai.estoque.DTO.ProdutoDTO;
import com.senai.estoque.database.model.Produto;
import com.senai.estoque.database.repository.EstoqueRepository;
import com.senai.estoque.database.repository.MovimentacaoRepository;
import com.senai.estoque.database.repository.ProdutoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final MovimentacaoRepository movimentacaoRepository;
    private final EstoqueRepository estoqueRepository;

    public ProdutoService(ProdutoRepository produtoRepository,
                          MovimentacaoRepository movimentacaoRepository,
                          EstoqueRepository estoqueRepository) {
        this.produtoRepository = produtoRepository;
        this.movimentacaoRepository = movimentacaoRepository;
        this.estoqueRepository = estoqueRepository;
    }

    public List<ProdutoDTO> listar() {
        return produtoRepository.findAll().stream().map(this::toResponseDTO).toList();
    }

    public ProdutoDTO buscarPorId(Long id) {
        return produtoRepository.findById(id)
                .map(this::toResponseDTO)
                .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado"));
    }

    public ProdutoDTO salvar(ProdutoDTO dto) {
        if (produtoRepository.existsByNomeIgnoreCase(dto.nome())) {
            throw new IllegalStateException("Já existe um produto cadastrado com esse nome");
        }
        Produto produto = Produto.builder()
                .nome(dto.nome())
                .unidade(dto.unidade())
                .build();
        return toResponseDTO(produtoRepository.save(produto));
    }

    public ProdutoDTO atualizar(Long id, ProdutoDTO dto) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado"));
        if (produtoRepository.existsByNomeIgnoreCaseAndIdNot(dto.nome(), id)) {
            throw new IllegalStateException("Já existe um produto cadastrado com esse nome");
        }
        produto.setNome(dto.nome());
        produto.setUnidade(dto.unidade());
        return toResponseDTO(produtoRepository.save(produto));
    }

    public void deletar(Long id) {
        if (!produtoRepository.existsById(id)) {
            throw new EntityNotFoundException("Produto não encontrado");
        }
        if (movimentacaoRepository.existsByProdutoId(id) || estoqueRepository.existsByProdutoId(id)) {
            throw new IllegalStateException("Produto em uso em movimentações ou estoque — não é possível remover");
        }
        produtoRepository.deleteById(id);
    }

    public List<ProdutoDTO> getByNome(String nome) {
        return produtoRepository.findAllByNomeContainingIgnoreCase(nome)
                .stream().map(this::toResponseDTO).toList();
    }

    private ProdutoDTO toResponseDTO(Produto produto) {
        return new ProdutoDTO(produto.getId(), produto.getNome(), produto.getUnidade());
    }
}