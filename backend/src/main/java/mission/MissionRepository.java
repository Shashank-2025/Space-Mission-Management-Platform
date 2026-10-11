package com.spaceops.space_mission_paltform.mission;

import org.springframework.data.jpa.repository.JpaRepository;
import com.spaceops.space_mission_paltform.mission.Mission;

public interface MissionRepository extends JpaRepository<Mission, Long> {
}
