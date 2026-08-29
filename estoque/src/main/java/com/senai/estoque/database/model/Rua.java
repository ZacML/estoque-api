package com.senai.estoque.database.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "rua")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Rua {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 10)
    private String codigo;

    @NotBlank
    @Column(nullable = false, length = 40)
    private String categoria;
}