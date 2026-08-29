package com.senai.estoque.Service;

import com.senai.estoque.DTO.DocaDTO;
import com.senai.estoque.database.model.Doca;
import com.senai.estoque.database.repository.DocaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DocaService {

    private final DocaRepository docaRepository;
    private final EventoService eventoService;

    public DocaService(DocaRepository docaRepository, EventoService eventoService) {
        this.docaRepository = docaRepository;
        this.eventoService = eventoService;
    }

    public List<DocaDTO> listar() {
        return docaRepository.findAll().stream().map(this::toResponseDTO).toList();
    }

    public DocaDTO buscarPorId(Long id) {
        return docaRepository.findById(id)
                .map(this::toResponseDTO)
                .orElseThrow(() -> new EntityNotFoundException("Doca não encontrada"));
    }

    public DocaDTO salvar(DocaDTO dto) {
        Doca doca = Doca.builder()
                .numero(dto.numero())
                .expedicao(dto.expedicao())
                .ocupada(dto.ocupada() != null ? dto.ocupada() : false)
                .build();
        DocaDTO salva = toResponseDTO(docaRepository.save(doca));
        eventoService.publicar("doca:status_changed", salva);
        return salva;
    }

    public DocaDTO atualizar(Long id, DocaDTO dto) {
        Doca doca = docaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Doca não encontrada"));
        doca.setNumero(dto.numero());
        doca.setExpedicao(dto.expedicao());
        if (dto.ocupada() != null) {
            doca.setOcupada(dto.ocupada());
        }
        DocaDTO atualizada = toResponseDTO(docaRepository.save(doca));
        eventoService.publicar("doca:status_changed", atualizada);
        return atualizada;
    }

    public void deletar(Long id) {
        if (!docaRepository.existsById(id)) {
            throw new EntityNotFoundException("Doca não encontrada");
        }
        docaRepository.deleteById(id);
        eventoService.publicar("doca:removed", id);
    }

    public List<DocaDTO> getLivres() {
        return docaRepository.findAllByOcupada(false)
                .stream().map(this::toResponseDTO).toList();
    }

    private DocaDTO toResponseDTO(Doca doca) {
        return new DocaDTO(doca.getId(), doca.getNumero(), doca.getExpedicao(), doca.getOcupada());
    }
}