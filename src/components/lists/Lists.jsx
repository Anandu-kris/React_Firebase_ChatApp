import ChatList from "./chatlist/ChatList"
import "./lists.css"
import UserInfo from "./userInfo/UserInfo"

const Lists = () => {
  return (
    <div className="lists">
        <UserInfo />
        <ChatList />
    </div>
  )
}

export default Lists