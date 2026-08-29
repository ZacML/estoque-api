package com.senai.estoque.Service;
import com.senai.estoque.DTO.PosicaoDTO;
import com.senai.estoque.database.model.Posicao;
import com.senai.estoque.database.model.Rua;
import com.senai.estoque.database.repository.PosicaoRepository;
import com.senai.estoque.database.repository.RuaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PosicaoService {

    private final PosicaoRepository posicaoRepository;
    private final RuaRepository ruaRepository;

    public PosicaoService(PosicaoRepository posicaoRepository, RuaRepository ruaRepository) {
        this.posicaoRepository = posicaoRepository;
        this.ruaRepository = ruaRepository;
    }

    public List<PosicaoDTO> listar() {
        return posicaoRepository.findAll().stream().map(this::toResponseDTO).toList();
    }

    public PosicaoDTO buscarPorId(Long id) {
        return posicaoRepository.findById(id)
                .map(this::toResponseDTO)
                .orElseThrow(() -> new EntityNotFoundException("Posição não encontrada"));
    }

    public PosicaoDTO salvar(PosicaoDTO dto) {
        Rua rua = ruaRepository.findById(dto.ruaId())
                .orElseThrow(() -> new EntityNotFoundException("Rua não encontrada"));
        Posicao posicao = Posicao.builder()
                .numero(dto.numero())
                .ocupada(dto.ocupada() != null ? dto.ocupada() : false)
                .rua(rua)
                .build();
        return toResponseDTO(posicaoRepository.save(posicao));
    }

    public PosicaoDTO atualizar(Long id, PosicaoDTO dto) {
        Posicao posicao = posicaoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Posição não encontrada"));
        Rua rua = ruaRepository.findById(dto.ruaId())
                .orElseThrow(() -> new EntityNotFoundException("Rua não encontrada"));
        posicao.setNumero(dto.numero());
        if (dto.ocupada() != null) {
            posicao.setOcupada(dto.ocupada());
        }
        posicao.setRua(rua);
        return toResponseDTO(posicaoRepository.save(posicao));
    }

    public void deletar(Long id) {
        if (!posicaoRepository.existsById(id)) {
            throw new EntityNotFoundException("Posição não encontrada");
        }
        posicaoRepository.deleteById(id);
    }

    public List<PosicaoDTO> getByRua(Long ruaId) {
        return posicaoRepository.findAllByRuaId(ruaId)
                .stream().map(this::toResponseDTO).toList();
    }

    private PosicaoDTO toResponseDTO(Posicao posicao) {
        return new PosicaoDTO(
                posicao.getId(),
                posicao.getNumero(),
                posicao.getOcupada(),
                posicao.getRua().getId()
        );
    }
}
