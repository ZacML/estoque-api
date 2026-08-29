package com.senai.estoque.controller;

import com.senai.estoque.DTO.PosicaoDTO;
import com.senai.estoque.Service.PosicaoService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/posicoes")
public class PosicaoController {

    private final PosicaoService posicaoService;

    public PosicaoController(PosicaoService posicaoService) {
        this.posicaoService = posicaoService;
    }

    @Operation(summary = "Listar posições", description = "Lista todas as posições")
    @GetMapping
    public List<PosicaoDTO> listar() {
        return posicaoService.listar();
    }

    @Operation(summary = "Salvar posição", description = "Cadastra uma nova posição")
    @PostMapping
    public PosicaoDTO salvar(@RequestBody @Valid PosicaoDTO dto) {
        return posicaoService.salvar(dto);
    }

    @Operation(summary = "Atualizar posição", description = "Atualiza uma posição existente")
    @PutMapping("/{id}")
    public PosicaoDTO atualizar(@PathVariable Long id, @RequestBody @Valid PosicaoDTO dto) {
        return posicaoService.atualizar(id, dto);
    }

    @Operation(summary = "Deletar posição", description = "Remove uma posição existente")
    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        posicaoService.deletar(id);
    }

    @Operation(summary = "Buscar por id", description = "Busca a posição pelo id")
    @GetMapping("/{id}")
    public PosicaoDTO buscarPorId(@PathVariable Long id) {
        return posicaoService.buscarPorId(id);
    }

    @Operation(summary = "Listar posições de uma rua", description = "Lista as 8 posições de uma rua")
    @GetMapping("/rua/{ruaId}")
    public List<PosicaoDTO> listarPorRua(@PathVariable Long ruaId) {
        return posicaoService.getByRua(ruaId);
    }
}
