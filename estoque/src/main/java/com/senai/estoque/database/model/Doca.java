package com.senai.estoque.database.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "doca")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doca {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(nullable = false)
    private Integer numero;

    @NotNull
    @Column(nullable = false)
    private Boolean expedicao;   // true = expedição, false = recebimento

    @Builder.Default
    @Column(nullable = false)
    private Boolean ocupada = false;
}