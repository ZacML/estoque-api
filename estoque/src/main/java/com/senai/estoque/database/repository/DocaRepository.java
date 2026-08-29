package com.senai.estoque.database.repository;

import com.senai.estoque.database.model.Doca;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DocaRepository extends JpaRepository<Doca, Long> {
    List<Doca> findAllByOcupada(Boolean ocupada);
}