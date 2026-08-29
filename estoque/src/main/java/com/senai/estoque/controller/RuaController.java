package com.senai.estoque.controller;

import com.senai.estoque.DTO.RuaDTO;
import com.senai.estoque.Service.RuaService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ruas")
public class RuaController {

    @Autowired
    private RuaService ruaService;

    @Operation(summary = "Listar ruas", description = "Lista todas as ruas cadastradas")
    @GetMapping
    public List<RuaDTO> listar() {
        return ruaService.listar();
    }

    @Operation(summary = "Salvar rua", description = "Cadastra uma nova rua")
    @PostMapping
    public RuaDTO salvar(@RequestBody @Valid RuaDTO dto) {
        return ruaService.salvar(dto);
    }

    @Operation(summary = "Atualizar rua", description = "Atualiza uma rua existente")
    @PutMapping("/{id}")
    public RuaDTO atualizar(@PathVariable Long id, @RequestBody @Valid RuaDTO dto) {
        return ruaService.atualizar(id, dto);
    }

    @Operation(summary = "Deletar rua", description = "Remove uma rua existente")
    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        ruaService.deletar(id);
    }

    @Operation(summary = "Buscar por id", description = "Busca a rua pelo id")
    @GetMapping("/{id}")
    public RuaDTO buscarPorId(@PathVariable Long id) {
        return ruaService.buscarPorId(id);
    }

    @Operation(summary = "Buscar por categoria", description = "Lista ruas de uma categoria")
    @GetMapping("/categoria/{categoria}")
    public List<RuaDTO> buscarPorCategoria(@PathVariable String categoria) {
        return ruaService.getByCategoria(categoria);
    }
}
