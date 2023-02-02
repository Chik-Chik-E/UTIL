import React, {useState, useEffect} from "react";
import styles from './PlanTodoListRightItem.module.css'
import { modifyPlanSliceActions } from '../../redux/planSlice'
import { useSelector, useDispatch } from 'react-redux'
import { editTodoAPI } from "../../api/Plan/editTodoAPI";
import { chkTodoAPI } from "../../api/Plan/chkTodoAPI";
import NotiDeliverer from "../UI/StackNotification/NotiDeliverer";
import { recvTodoPeriodAPI } from "../../api/Plan/recvTodoPeriodAPI";
import { recvIsAllTodosDoneAPI } from "../../api/Plan/recvIsAllTodosDoneAPI";
import FixedModal from "../UI/FixedModal/FixedModal";
import complete from "../../img/Complete.png"
import Button from "../UI/Button/Button";

const PlanTodoListRightItem = (props) => {

    const dispatch = useDispatch()
    const todos = useSelector(state => state.planSlice.todos)
    const [isDateEditMode, setIsDateEditMode] = useState(false)
    const [dateValue, setDateValue] = useState(props.toStringByFormatting(new Date(props.el.dueDate)))
    const [isDescriptionEditMode, setIsDescriptionEditMode] = useState(false)
    const [descriptionValue, setDescriptionValue] = useState(props.el.description)
    const [refresh, setRefresh] = useState(false)

    


    const enterDateEditMode = () => {
        setIsDateEditMode(true)
    }

    const cancelDateEditMode = () => {
        
        const processing = {
            title: props.el.title,
            description: props.el.description,
            state: props.el.state,
            dueDate: dateValue,
        }
        editTodoAPI(props.el.todoId, props.goalId, processing)
        .then((res) => {
            const processing = {
                goalId: props.goalId,
                data: res
            }
            dispatch(modifyPlanSliceActions.responseTodos(JSON.stringify(processing)))
        })
        .then((res) => {
            setIsDateEditMode(false)
        })
        recvTodoPeriodAPI(props.goalId)
        .then((res) => {
            const processing = {
                goalId: props.goalId,
                data: res
            }
            console.log(res)
            dispatch(modifyPlanSliceActions.responseTodoPeriod(JSON.stringify(processing)))
        })
        
    }

    const dateInputSubmitHandler = (event) => {
        if (event.key === 'Enter') {
            cancelDateEditMode()
        }
    }

    const dateInputChangeHandler = (event) => {
        setDateValue(event.target.value)
    }

    const enterDescriptionEditMode = () => {
        setIsDescriptionEditMode(true)
    }

    const cancelDescriptionEditMode = () => {
        const processing = {
            title: props.el.title,
            description: descriptionValue,
            state: props.el.state,
            dueDate: props.el.dueDate,
        }
        editTodoAPI(props.el.todoId, props.goalId, processing)
        .then((res) => {
            const proccessing = {
                goalId: props.goalId,
                data: res
            }
            dispatch(modifyPlanSliceActions.responseTodos(JSON.stringify(proccessing)))
        })
        .then((res) => {
            setIsDescriptionEditMode(false) 
        })

        
    }

    const descriptionInputSubmitHandler = (event) => {
        if (event.key === 'Enter') {
            cancelDescriptionEditMode()
        }
    }

    const descriptionInputChangeHandler = (event) => {
        setDescriptionValue(event.target.value)
    }


    const toggleIsDone = () => {
        chkTodoAPI(props.el.todoId, props.goalId)
        .then((res) => {
            const proccessing = {
                goalId: props.goalId,
                data: res
            }
            dispatch(modifyPlanSliceActions.responseTodos(JSON.stringify(proccessing)))
            
            
        })
        .then((res) => {
            

            recvIsAllTodosDoneAPI(props.goalId)
            .then((res) => {
                console.log('목표 투두 완료', res)
                if (res === true) {
                    const today = new Date()
                    if (today > new Date(props.plan.endDate)) {
                        setDoneModalState(true)
                    } else {
                        setNotiContent(message2)
                        setDoneNotiState(true)
                    }
                    
                } else {
                    if (props.el.state === false) {
                        setNotiContent(message1)
                        setDoneNotiState(true)
                    }
                    
                }
            })
        })
        
    }

    const message1 = (
        <div style={{height: '100px', display:'flex', flexDirection:'column', justifyContent:'space-around'}}>
            <div><b>{props.el.title}</b>을 완료하였습니다.</div>
            <div>회고록을 작성 하시겠습니까?</div>
            <Button>작성하기</Button>
        </div>
    )

    const message2 = (
        <div style={{height: '100px', display:'flex', flexDirection:'column', justifyContent:'space-around'}}>
            <div>해당 목표의 TODO를 모두 완료하였습니다.</div>
            <div>목표를 완료하거나 새 TODO를 작성하세요.</div>
            <div style={{display:'flex', justifyContent:'space-around', marginTop: '16px'}}>
                <Button>TODO 작성</Button>
                <Button>회고록 작성</Button>
                <Button>목표 완료</Button>
            </div>
        </div>
    )

    const [doneModalState, setDoneModalState] = useState(false)
    const [doneNotiState, setDoneNotiState] = useState(false)
    const [notiContent, setNotiContent] = useState()

    const doneModalForm = (
        <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>

            <img style={{width:'228px', height:'auto', marginBottom: '24px'}} src={complete} />

            <div>
                <p style={{lineHeight: '40%'}}>기간이 만료된 목표의 모든 TODO를 완료하였습니다.</p>
                <p style={{lineHeight: '40%'}}>회고록을 작성하고 목표를 완료하세요.</p>
            </div>  
            
        </div>
    )

    const addBtn = [<Button>회고록 작성</Button>,<Button>목표 완료</Button>]

    const isDoneTrue = (
        <div onClick={toggleIsDone} className={styles['is-done-true-wrapper']}>
            완료됨
        </div>
    )

    const isDoneFalse = (
        <div onClick={toggleIsDone} className={styles['is-done-false-wrapper']}>
            진행중
        </div>
    )

    const dateReadMode = (
        <div onClick={enterDateEditMode} className={styles['todo-duedate-wrapper']}>
            {`${props.time.getFullYear()}년 ${props.time.getMonth() + 1}월 ${props.time.getDate()}일`},
        </div>
    )

    const descriptionReadMode = (
        <div onClick={enterDescriptionEditMode} className={styles['todo-description-wrapper']}>
            {props.el.description}
        </div>
    )

    const dateEditInput = (
        <input type="date" onBlur={cancelDateEditMode} onKeyPress={dateInputSubmitHandler} onChange={dateInputChangeHandler} value={dateValue} autoFocus className={styles['edit-date-input']} />
    )

    const descriptionEditInput = (
        <input type="text" onBlur={cancelDescriptionEditMode} onKeyPress={descriptionInputSubmitHandler} onChange={descriptionInputChangeHandler} value={descriptionValue} placeholder="메모를 입력해 주세요." autoFocus className={styles['edit-description-input']} />
    )

    return (
        <div className={styles['todo-space-wrapper']} style={{width: `${props.containerRef?.current?.scrollWidth}px`}}>
            <FixedModal modalState={doneModalState} stateHandler={setDoneModalState} content={doneModalForm} addBtn={addBtn} width={400} height={410} />
            {doneNotiState && <NotiDeliverer content={notiContent} stateHandler={setDoneNotiState} duration={5000} />}
            <div className={styles['todo-space']} >
                {props.el.state ? isDoneTrue : isDoneFalse}
                {isDateEditMode ? dateEditInput : dateReadMode}
                {isDescriptionEditMode ? descriptionEditInput : descriptionReadMode}
                
                
            </div>
            {/*  */}
        </div>
    )
}

export default PlanTodoListRightItem