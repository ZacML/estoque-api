package com.senai.estoque.controller;

import com.senai.estoque.DTO.MovimentacaoDTO;
import com.senai.estoque.Service.MovimentacaoService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/movimentacoes")
public class MovimentacaoController {

    private final MovimentacaoService movimentacaoService;

    public MovimentacaoController(MovimentacaoService movimentacaoService) {
        this.movimentacaoService = movimentacaoService;
    }

    @Operation(summary = "Listar movimentações", description = "Lista todas as movimentações")
    @GetMapping
    public List<MovimentacaoDTO> listar() {
        return movimentacaoService.listar();
    }

    @Operation(summary = "Salvar movimentação", description = "Registra uma entrada ou saída")
    @PostMapping
    public MovimentacaoDTO salvar(@RequestBody @Valid MovimentacaoDTO dto) {
        return movimentacaoService.salvar(dto);
    }

    @Operation(summary = "Atualizar movimentação", description = "Atualiza uma movimentação existente")
    @PutMapping("/{id}")
    public MovimentacaoDTO atualizar(@PathVariable Long id, @RequestBody @Valid MovimentacaoDTO dto) {
        return movimentacaoService.atualizar(id, dto);
    }

    @Operation(summary = "Deletar movimentação", description = "Remove uma movimentação existente")
    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        movimentacaoService.deletar(id);
    }

    @Operation(summary = "Buscar por id", description = "Busca a movimentação pelo id")
    @GetMapping("/{id}")
    public MovimentacaoDTO buscarPorId(@PathVariable Long id) {
        return movimentacaoService.buscarPorId(id);
    }

    @Operation(summary = "Saídas pendentes", description = "Lista as saídas aguardando autorização")
    @GetMapping("/pendentes")
    public List<MovimentacaoDTO> saidasPendentes() {
        return movimentacaoService.getSaidasPendentes();
    }

    @Operation(summary = "Autorizar saída", description = "Autoriza e libera a saída do caminhão")
    @PutMapping("/{id}/autorizar")
    public MovimentacaoDTO autorizarSaida(@PathVariable Long id) {
        return movimentacaoService.autorizarSaida(id);
    }
}
