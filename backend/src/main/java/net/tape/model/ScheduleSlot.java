package net.tape.model;

import lombok.Getter;
import lombok.Setter;

/** Domain model — framework-free POJO. */
@Getter
@Setter
public class ScheduleSlot {
    private Long id;
    private Integer dayOfWeek;
    private String timeEt;
    private Long showId;
    private String showName;
    private String showSlug;
    private String hostsLabel;
    private boolean live;
    private int sort;
}
