package com.senai.estoque.database.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "posicao")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Posicao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(nullable = false)
    private Integer numero;

    @Builder.Default
    @Column(nullable = false)
    private Boolean ocupada = false;

    @ManyToOne
    @JoinColumn(name = "id_rua", nullable = false)
    private Rua rua;
}
