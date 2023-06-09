package com.youtil.server.dto.goal;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.youtil.server.domain.goal.Goal;
import com.youtil.server.domain.user.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class GoalResponse {

    private Long goalId;
    private String title;
    private String startDate;
    private String endDate;
    private boolean state;
    private String imageUrl;

    public GoalResponse(Goal goal){
        this.goalId = goal.getGoalId();
        this.title = goal.getTitle();
        this.startDate = goal.getStartDate();
        this.endDate = goal.getEndDate();
        this.state = goal.isState();
        this.imageUrl = "https://utilbucket.s3.ap-northeast-2.amazonaws.com/static/goal/"+goal.getImageUrl();
    }


}
