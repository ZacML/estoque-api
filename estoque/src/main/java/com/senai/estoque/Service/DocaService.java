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

    public DocaService(DocaRepository docaRepository) {
        this.docaRepository = docaRepository;
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
        return toResponseDTO(docaRepository.save(doca));
    }

    public DocaDTO atualizar(Long id, DocaDTO dto) {
        Doca doca = docaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Doca não encontrada"));
        doca.setNumero(dto.numero());
        doca.setExpedicao(dto.expedicao());
        if (dto.ocupada() != null) {
            doca.setOcupada(dto.ocupada());
        }
        return toResponseDTO(docaRepository.save(doca));
    }

    public void deletar(Long id) {
        if (!docaRepository.existsById(id)) {
            throw new EntityNotFoundException("Doca não encontrada");
        }
        docaRepository.deleteById(id);
    }

    public List<DocaDTO> getLivres() {
        return docaRepository.findAllByOcupada(false)
                .stream().map(this::toResponseDTO).toList();
    }

    private DocaDTO toResponseDTO(Doca doca) {
        return new DocaDTO(doca.getId(), doca.getNumero(), doca.getExpedicao(), doca.getOcupada());
    }
}