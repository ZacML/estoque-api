package com.senai.estoque.Service;

import com.senai.estoque.DTO.RuaDTO;
import com.senai.estoque.database.model.Rua;
import com.senai.estoque.database.repository.RuaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RuaService {

    private static final long MAX_RUAS = 6;

    private final RuaRepository ruaRepository;

    public RuaService(RuaRepository ruaRepository) {
        this.ruaRepository = ruaRepository;
    }

    public List<RuaDTO> listar() {
        return ruaRepository.findAll().stream().map(this::toResponseDTO).toList();
    }

    public RuaDTO buscarPorId(Long id) {
        return ruaRepository.findById(id)
                .map(this::toResponseDTO)
                .orElseThrow(() -> new EntityNotFoundException("Rua não encontrada"));
    }

    public RuaDTO salvar(RuaDTO dto) {
        if (ruaRepository.count() >= MAX_RUAS) {          // <- ANTES de tudo
            throw new IllegalStateException("Limite de 6 ruas atingido");
        }

        Rua rua = Rua.builder()
                .codigo(dto.codigo())
                .categoria(dto.categoria())
                .build();
        return toResponseDTO(ruaRepository.save(rua));
    }

    public RuaDTO atualizar(Long id, RuaDTO dto) {
        Rua rua = ruaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Rua não encontrada"));
        rua.setCodigo(dto.codigo());
        rua.setCategoria(dto.categoria());
        return toResponseDTO(ruaRepository.save(rua));
    }

    public void deletar(Long id) {
        if (!ruaRepository.existsById(id)) {
            throw new EntityNotFoundException("Rua não encontrada");
        }
        ruaRepository.deleteById(id);
    }

    public List<RuaDTO> getByCategoria(String categoria) {
        return ruaRepository.findAllByCategoriaContainingIgnoreCase(categoria)
                .stream().map(this::toResponseDTO).toList();
    }

    private RuaDTO toResponseDTO(Rua rua) {
        return new RuaDTO(rua.getId(), rua.getCodigo(), rua.getCategoria());
    }
}