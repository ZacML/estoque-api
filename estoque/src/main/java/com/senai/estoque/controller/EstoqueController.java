package com.senai.estoque.controller;

import com.senai.estoque.DTO.EstoqueDTO;
import com.senai.estoque.Service.EstoqueService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/estoques")
public class EstoqueController {

    private final EstoqueService estoqueService;

    public EstoqueController(EstoqueService estoqueService) {
        this.estoqueService = estoqueService;
    }

    @Operation(summary = "Listar estoque", description = "Lista todos os itens de estoque")
    @GetMapping
    public List<EstoqueDTO> listar() {
        return estoqueService.listar();
    }

    @Operation(summary = "Salvar item de estoque", description = "Cadastra um item de estoque")
    @PostMapping
    public EstoqueDTO salvar(@RequestBody @Valid EstoqueDTO dto) {
        return estoqueService.salvar(dto);
    }

    @Operation(summary = "Atualizar item de estoque", description = "Atualiza um item de estoque")
    @PutMapping("/{id}")
    public EstoqueDTO atualizar(@PathVariable Long id, @RequestBody @Valid EstoqueDTO dto) {
        return estoqueService.atualizar(id, dto);
    }

    @Operation(summary = "Deletar item de estoque", description = "Remove um item de estoque")
    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        estoqueService.deletar(id);
    }

    @Operation(summary = "Buscar por id", description = "Busca o item de estoque pelo id")
    @GetMapping("/{id}")
    public EstoqueDTO buscarPorId(@PathVariable Long id) {
        return estoqueService.buscarPorId(id);
    }

    @Operation(summary = "Buscar por produto", description = "Lista itens de estoque de um produto")
    @GetMapping("/produto/{produtoId}")
    public List<EstoqueDTO> listarPorProduto(@PathVariable Long produtoId) {
        return estoqueService.getByProduto(produtoId);
    }
}
