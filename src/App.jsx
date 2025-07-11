import { useEffect } from "react";
import Chats from "./components/chats/Chats";
import Details from "./components/details/Details";
import Lists from "./components/lists/Lists";
import Notification from "./components/notification/Notification";
import Login from "./components/login/Login";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useUserStore } from "./lib/userStore";
import CustomLoader from "./components/ui/CustomLoader";
import { useChatStore } from "./lib/chatStore";

const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();
  console.log("chatId from App::", chatId);

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });
    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  console.log(currentUser);

  if (isLoading) return <CustomLoader />;

  return (
    <div className="container">
      {currentUser ? (
        <>
          <Lists />
          {chatId && <Chats />}
          {chatId && <Details />}
        </>
      ) : (
        <Login />
      )}
      <Notification />
    </div>
  );
};

export default App;
