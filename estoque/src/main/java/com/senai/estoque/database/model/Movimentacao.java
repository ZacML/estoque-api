package com.senai.estoque.database.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "movimentacao")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Movimentacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(nullable = false)
    private Boolean saida;   // true = saída, false = entrada

    @NotNull
    @Column(name = "data_hora", nullable = false)
    private LocalDateTime dataHora;

    @NotNull
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantidade;

    @Column(length = 10)
    private String placa;

    @Column(length = 80)
    private String motorista;

    @Column(length = 80)
    private String transportadora;

    @Column(length = 20)
    private String nota;

    @Builder.Default
    @Column(nullable = false)
    private Boolean autorizada = false;

    @Builder.Default
    @Column(nullable = false)
    private Boolean liberada = false;

    @ManyToOne
    @JoinColumn(name = "id_produto", nullable = false)
    private Produto produto;

    @ManyToOne
    @JoinColumn(name = "id_posicao")
    private Posicao posicao;

    @ManyToOne
    @JoinColumn(name = "id_doca")
    private Doca doca;


}