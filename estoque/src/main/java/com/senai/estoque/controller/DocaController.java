package com.senai.estoque.controller;

import com.senai.estoque.DTO.DocaDTO;
import com.senai.estoque.Service.DocaService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/docas")
public class DocaController {

    private final DocaService docaService;

    public DocaController(DocaService docaService) {
        this.docaService = docaService;
    }

    @Operation(summary = "Listar docas", description = "Lista todas as docas")
    @GetMapping
    public List<DocaDTO> listar() {
        return docaService.listar();
    }

    @Operation(summary = "Salvar doca", description = "Cadastra uma nova doca")
    @PostMapping
    public DocaDTO salvar(@RequestBody @Valid DocaDTO dto) {
        return docaService.salvar(dto);
    }

    @Operation(summary = "Atualizar doca", description = "Atualiza uma doca existente")
    @PutMapping("/{id}")
    public DocaDTO atualizar(@PathVariable Long id, @RequestBody @Valid DocaDTO dto) {
        return docaService.atualizar(id, dto);
    }

    @Operation(summary = "Deletar doca", description = "Remove uma doca existente")
    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        docaService.deletar(id);
    }

    @Operation(summary = "Buscar por id", description = "Busca a doca pelo id")
    @GetMapping("/{id}")
    public DocaDTO buscarPorId(@PathVariable Long id) {
        return docaService.buscarPorId(id);
    }

    @Operation(summary = "Listar docas livres", description = "Lista as docas que estão livres")
    @GetMapping("/livres")
    public List<DocaDTO> listarLivres() {
        return docaService.getLivres();
    }
}
