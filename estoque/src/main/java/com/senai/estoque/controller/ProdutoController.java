package com.senai.estoque.controller;

import com.senai.estoque.DTO.ProdutoDTO;
import com.senai.estoque.Service.ProdutoService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/produtos")
public class ProdutoController {

    private final ProdutoService produtoService;

    public ProdutoController(ProdutoService produtoService) {
        this.produtoService = produtoService;
    }

    @Operation(summary = "Listar produtos", description = "Lista todos os produtos")
    @GetMapping
    public List<ProdutoDTO> listar() {
        return produtoService.listar();
    }

    @Operation(summary = "Salvar produto", description = "Cadastra um novo produto")
    @PostMapping
    public ProdutoDTO salvar(@RequestBody @Valid ProdutoDTO dto) {
        return produtoService.salvar(dto);
    }

    @Operation(summary = "Atualizar produto", description = "Atualiza um produto existente")
    @PutMapping("/{id}")
    public ProdutoDTO atualizar(@PathVariable Long id, @RequestBody @Valid ProdutoDTO dto) {
        return produtoService.atualizar(id, dto);
    }

    @Operation(summary = "Deletar produto", description = "Remove um produto existente")
    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        produtoService.deletar(id);
    }

    @Operation(summary = "Buscar por id", description = "Busca o produto pelo id")
    @GetMapping("/{id}")
    public ProdutoDTO buscarPorId(@PathVariable Long id) {
        return produtoService.buscarPorId(id);
    }

    @Operation(summary = "Buscar por nome", description = "Lista produtos pelo nome")
    @GetMapping("/buscar")
    public List<ProdutoDTO> buscarPorNome(@RequestParam String nome) {
        return produtoService.getByNome(nome);
    }
}
