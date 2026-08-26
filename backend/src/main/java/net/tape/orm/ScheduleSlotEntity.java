package net.tape.orm;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "schedule_slot")
@Getter
@Setter
public class ScheduleSlotEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "day_of_week")
    private Integer dayOfWeek; // 0=Sun..6=Sat, null = every weekday

    @Column(name = "time_et", nullable = false)
    private String timeEt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "show_id", insertable = false, updatable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private ShowEntity show;

    @Column(name = "show_id")
    private Long showId;

    @Column(name = "hosts_label")
    private String hostsLabel;

    @Column(name = "is_live", nullable = false)
    private boolean live = false;

    @Column(nullable = false)
    private int sort = 0;
}
