package com.senai.estoque;

import com.senai.estoque.DTO.RuaDTO;
import com.senai.estoque.Service.RuaService;
import com.senai.estoque.database.model.Rua;
import com.senai.estoque.database.repository.RuaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RuaServiceTest {

    @Mock
    private RuaRepository ruaRepository;

    @InjectMocks
    private RuaService ruaService;

    @Test
    void naoDeveCadastrarAlemDe6Ruas() {
        // já existem 6 ruas cadastradas
        when(ruaRepository.count()).thenReturn(6L);

        RuaDTO setima = new RuaDTO(null, "R07", "Bazar");

        // ao tentar a 7ª, deve estourar exceção
        IllegalStateException ex = assertThrows(
                IllegalStateException.class,
                () -> ruaService.salvar(setima)
        );
        assertEquals("Limite de 6 ruas atingido", ex.getMessage());

        // e NÃO pode ter chamado o save
        verify(ruaRepository, never()).save(any(Rua.class));
    }

    @Test
    void deveCadastrarQuandoAindaTemMenosDe6() {
        // só existem 5 ruas — a 6ª é permitida
        when(ruaRepository.count()).thenReturn(5L);
        when(ruaRepository.save(any(Rua.class)))
                .thenReturn(Rua.builder().id(6L).codigo("R06").categoria("Bazar").build());

        RuaDTO sexta = new RuaDTO(null, "R06", "Bazar");
        RuaDTO salva = ruaService.salvar(sexta);

        assertEquals("R06", salva.codigo());
        verify(ruaRepository, times(1)).save(any(Rua.class));
    }
}