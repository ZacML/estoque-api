package com.senai.estoque.database.repository;

import com.senai.estoque.database.model.Rua;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RuaRepository extends JpaRepository<Rua, Long> {
    List<Rua> findAllByCategoriaContainingIgnoreCase(String categoria);
}
