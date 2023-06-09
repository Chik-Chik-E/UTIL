import React, { useState, useRef } from "react";
import styles from "./Plan.module.css";
import {
  useNavigate,
} from "react-router-dom";
import PlanCalendar from "./PlanCalendar";
import { useSelector, useDispatch } from "react-redux";
import { modifyPlanSliceActions } from "../../redux/planSlice";
import PlanItem from "./PlanItem";
import { newPlanAPI } from "../../api/Plan/newPlanAPI";
import { newTodoAPI } from "../../api/Plan/newTodoAPI";
import { recvTodosAPI } from "../../api/Plan/recvTodosAPI";
import { recvTodoPeriodAPI } from "../../api/Plan/recvTodoPeriodAPI";
import warning from "../../img/Warning.png";
import NotiDeliverer from "../UI/StackNotification/NotiDeliverer";


const Plan = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const plans = useSelector((state) => state.planSlice.plans);
  const todos = useSelector((state) => state.planSlice.todos);
  const [startRange, setStartRange] = useState(props.startRange);
  const [endRange, setEndRange] = useState(props.endRange);

  const planSpaceRef = useRef();
  const plansTitleWrapperRef = useRef();
  const plansTitleInnerRef = useRef();
  const [todoFormVisibility, setTodoFormVisibility] = useState(
    Array(plans.length).fill(false)
  );

  const todoFormToggleHandler = (idx, goalId) => {
    const copyArr = [...todoFormVisibility];

    if (copyArr[idx] === false) {
      recvTodosAPI(goalId)
        .then((res) => {
          const processing = {
            goalId: goalId,
            data: res,
          };
          dispatch(
            modifyPlanSliceActions.responseTodos(JSON.stringify(processing))
          );
        })
        .then((res) => {
          copyArr[idx] = true;
          setTodoFormVisibility(() => copyArr);
        });
    } else {
      copyArr[idx] = false;
      setTodoFormVisibility(() => copyArr);
    }
  };

  const extendStartRange = (amount) => {
    const extendedDate = new Date(
      startRange.getFullYear(),
      startRange.getMonth() - amount,
      1
    );
    setStartRange(() => extendedDate);
  };

  const extendEndRange = (amount) => {
    const extendedDate = new Date(
      endRange.getFullYear(),
      endRange.getMonth() + amount + 1,
      0
    );
    setEndRange(() => extendedDate);
  };

  const [newTodoGoalId, setNewTodoGoalId] = useState();
  const getNewTodoIdx = (received) => {
    setNewTodoGoalId(received);
  };

  const [inputTodoData, setInputTodoData] = useState({
    title: "",
    dueDate: "",
    description: "",
    state: false,
    goalId: null,
  });

  const getInputTodoData = (
    title = null,
    dueDate = null,
    description = null,
    goalId = null
  ) => {
    if (inputTodoData.goalId !== goalId) {
      setInputTodoData({
        title: "",
        dueDate: "",
        description: "",
        state: false,
        goalId: null,
      });
    }

    const processing = {
      title: title ? title : inputTodoData.title,
      dueDate: dueDate ? dueDate : inputTodoData.dueDate,
      description: description ? description : inputTodoData.description,
      state: false,
      goalId: goalId,
    };
    setInputTodoData(() => processing);
  };

  const applyTodoData = () => {
    if (inputTodoData.title === "" || inputTodoData.dueDate === "") {
      return;
    }

    newTodoAPI(newTodoGoalId, inputTodoData)
      .then((res) => {
        const proccessing = {
          goalId: newTodoGoalId,
          data: res,
        };
        dispatch(
          modifyPlanSliceActions.responseTodos(JSON.stringify(proccessing))
        );
        setNewTodoGoalId(-1);
        setInputTodoData({
          title: "",
          dueDate: "",
          description: "",
          state: false,
          goalId: null,
        });
      })
      .then((res) => {
        recvTodoPeriodAPI(newTodoGoalId)
          .then((res) => {
            const processing = {
              goalId: newTodoGoalId,
              data: res,
            };
            dispatch(
              modifyPlanSliceActions.responseTodoPeriod(
                JSON.stringify(processing)
              )
            );
          })
          .catch((err) => {
            console.log("Plan : recvTodoPeriodAPI => ", err);
          });
      })
      .catch((err) => {
        console.log("Plan : newTodoAPI => ", err);

        if (err.response.data.message == "todo 날짜가 목표 범위 벗어남") {
          setNotiState(true);
        }
      });
  };

  const planTitleGrid = Object.keys(plans).map((el, idx) => {
    return (
      // <React.Fragment>
      //     <div  id={`${plans[idx].goalId}`} className={`${styles['plan-title-bar']} ${idx % 2 ? styles['title-odd'] : styles['title-even']}`} key={`month-title-bar-${idx}`}>
      //         <div onClick={todoFormToggleHandler.bind(this, idx)} className={styles['plan-title-bar-icon-wrapper']}>
      //             <img className={styles['arrow-icon']} src={arrow} style={{transform: todoFormVisibility[idx] ? 'rotate(90deg)' : 'none', marginLeft:'13px', width: '12px', height: 'auto'}}/>
      //         </div>
      //         <div className={styles['plan-title-bar-button']}>
      //             {plans[idx].title}
      //             <svg className={styles['delete-icon']} xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor"  viewBox="0 0 16 16" style={{color:"rgb(100, 100, 100)"}}>
      //                 <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
      //                 <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
      //             </svg>
      //         </div>
      //     </div>
      //     {todoFormVisibility[idx] && <PlanTodoListLeft goalId={plans[idx].goalId} todos={todos} getNewTodoIdx={getNewTodoIdx} newTodoGoalId={newTodoGoalId} />}
      // </React.Fragment>
      <PlanItem
        contracted={props.contracted}
        plans={plans}
        plan={plans[el]}
        idx={idx}
        key={`month-title-bar-${idx}`}
        applyTodoData={applyTodoData}
        getInputTodoData={getInputTodoData}
        todoFormToggleHandler={todoFormToggleHandler}
        todoFormVisibility={todoFormVisibility}
        todos={todos}
        getNewTodoIdx={getNewTodoIdx}
        newTodoGoalId={newTodoGoalId}
      />
    );
  });

  const [newPlan, setNewPlan] = useState(false);

  const newPlanClickShow = () => {
    setNewPlan(true);
  };

  const newPlanClickHide = () => {
    setNewPlan(false);
  };

  const plusImg = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      style={{
        color: "rgb(100,100,100)",
        marginLeft: "-5px",
        marginRight: "7px",
      }}
      width="24"
      height="24"
      fill="currentColor"
      className="bi bi-plus"
      viewBox="0 0 16 16"
    >
      <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
    </svg>
  );

  const [newPlanValue, setNewPlanValue] = useState();
  const newPlanValueHandler = (event) => {
    setNewPlanValue(event.target.value);
  };

  const addNewPlan = (event) => {
    const endDate = new Date(new Date().setDate(new Date().getDate() + 5));
    if (event.key === "Enter") {
      newPlanAPI(new Date(), endDate, newPlanValue)
        .catch((err) => {
          // navigate('/login');
          console.log("Plan : newPlanAPI => ", err);
          if (err.response.data[0].message == "목표 내용이 없습니다.") {
            setNewPlan(false);
          }
        })
        .then((res) => {
          dispatch(modifyPlanSliceActions.responsePlans(JSON.stringify(res)));
          setNewPlanValue("");
          setNewPlan(false);
        });
    }
  };

  const newPlanDummy = (
    <div
      onClick={newPlanClickShow}
      className={`${styles["new-plan-button"]} ${styles["plan-title-bar"]} ${
        plans.length % 2 ? styles["title-odd"] : styles["title-even"]
      }`}
      style={{ width: `${props.contracted === true ? "160px" : "240px"}` }}
    >
      {newPlan ? (
        <input
          type="text"
          onChange={newPlanValueHandler}
          value={newPlanValue}
          onKeyPress={(event) => {
            addNewPlan(event);
          }}
          onBlur={newPlanClickHide}
          placeholder="목표를 입력해 주세요."
          autoFocus
          className={styles["new-plan-input"]}
        />
      ) : (
        <div className={styles["new-plan"]}>{plusImg} 목표 작성</div>
      )}
    </div>
  );

  const planCalender = (
    <PlanCalendar
      contracted={props.contracted}
      applyTodoData={applyTodoData}
      getInputTodoData={getInputTodoData}
      columns={props.columns}
      startRange={startRange}
      endRange={endRange}
      extendStartRange={extendStartRange}
      extendEndRange={extendEndRange}
      plansTitleWrapperRef={plansTitleWrapperRef}
      plansTitleInnerRef={plansTitleInnerRef}
      plans={plans}
      todoFormVisibility={todoFormVisibility}
      todos={todos}
      newTodoGoalId={newTodoGoalId}
    />
  );

  const errorMessage = (
    <div
      style={{
        display: "flex",
        justifyContent: "space-evenly",
        alignItems: "center",
      }}
    >
      <img
        style={{ width: "40px", height: "40px", marginRight: "12px" }}
        src={warning}
      />
      <div>
        <p>
          TODO의 날짜는 현재 작성중인 TODO 목표의 <br/>날짜 범위를 미만 & 초과할 수 없습니다.
        </p>
      </div>
    </div>
  );

  const [notiState, setNotiState] = useState(false);

  return (
    <div className={styles["plans-wrapper"]}>
      {notiState && (
        <NotiDeliverer
          content={errorMessage}
          stateHandler={setNotiState}
          duration={5000}
          width={400}
        />
      )}
      <div className={styles["plans-title-wrapper"]}>
        <div
          className={styles["plan-title-bar-space"]}
          style={{ width: `${props.contracted === true ? "170px" : "250px"}` }}
        />
        <div className={styles["plans-titles"]} ref={plansTitleWrapperRef}>
          <div
            className={styles["plans-titles-inner"]}
            ref={plansTitleInnerRef}
          >
            {planTitleGrid}
            {props.columns ? null : newPlanDummy}
          </div>
        </div>
        {props.contracted === true ? null : (
          <div ref={planSpaceRef} className={styles["plan-space"]} />
        )}
      </div>
      {planCalender}
    </div>
  );
};

export default Plan;
