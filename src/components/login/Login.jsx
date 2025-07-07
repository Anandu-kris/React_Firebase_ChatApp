import { useState } from "react";
import { toast } from "react-toastify";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, getDocs, setDoc } from "firebase/firestore";
import upload from "../../lib/upload";
import { collection, query, where } from "firebase/firestore";
import {
  Container,
  Typography,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  Box,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { styled } from "@mui/system";

const AvatarInput = styled("input")({
  display: "none",
});

const StyledContainer = styled(Container)({
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "20px",
});

const ToggleSwitch = styled(ToggleButtonGroup)({
  marginTop: "30px",
  marginBottom: "20px",
  border: "none",
  display: "flex",
  gap: "40px",
});

const ItemBox = styled(Box)({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "20px",
});

const StyledBox = styled(Box)({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "20px",
  marginTop: "100px"
});

const Form = styled("form")({
  marginTop: "20px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "30px",
});

const CustomToggleButton = styled(ToggleButton)({
  color: "white",
  border: "none",
  "&.Mui-selected": {
    backgroundColor: "#1f8ef135",
    color: "white",
  },
  "&:hover": {
    backgroundColor: "#1f8ef135",
    color: "white",
  },
});

const StyledTextField = styled(TextField)({
  width: "25rem",
  backgroundColor: "rgba(17, 25, 40, 0.9)",
  color: "white",
  borderRadius: "10px",
  "& .MuiInputBase-input": {
    color: "white",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "transparent",
    },
    "&:hover fieldset": {
      borderColor: "white",
    },
    "&.Mui-focused fieldset": {
      borderColor: "white",
    },
  },
  "& .MuiInputLabel-root": {
    color: "white",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "white",
  },
  "& .MuiInputBase-input::placeholder": {
    color: "white",
    opacity: 1,
  },
});

const StyledButton = styled(Button)({
  width: "100%",
  fontSize: "medium",
  padding: "20px",
  backgroundColor: "#1f8ef1",
  color: "white",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: 500,
  "&:disabled": {
    cursor: "not-allowed",
    backgroundColor: "#1f8ff19c",
  },
});

const Login = () => {
  const [avatar, setAvatar] = useState({
    file: null,
    url: "",
  });

  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);

    const { username, email, password } = Object.fromEntries(formData);

    if (!username || !email || !password)
      return toast.warn("Please enter inputs!");
    if (!avatar.file) return toast.warn("Please upload an avatar!");

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      setLoading(false);
      return toast.warn("Select another username");
    }

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      const imgUrl = await upload(avatar.file);

      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        avatar: imgUrl,
        id: res.user.uid,
        blocked: [],
      });

      await setDoc(doc(db, "userchats", res.user.uid), {
        chats: [],
      });

      toast.success("Account created! You can login now!");
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledContainer maxWidth="sm">
      <ToggleSwitch
        value={isRegistering ? "register" : "login"}
        exclusive
        onChange={() => setIsRegistering((prev) => !prev)}
      >
        <CustomToggleButton value="login">Sign In</CustomToggleButton>
        <CustomToggleButton value="register">Sign Up</CustomToggleButton>
      </ToggleSwitch>

      {isRegistering ? (
        <ItemBox>
          <Typography variant="h4">Create an Account</Typography>
          <Form onSubmit={handleRegister}>
            <label htmlFor="avatar-upload">
              <Avatar
                src={avatar.url || "./avatar.png"}
                sx={{
                  width: 80,
                  height: 80,
                  cursor: "pointer",
                  marginBottom: 2,
                  marginLeft: 2,
                }}
              />
              <Typography>Upload an image</Typography>
            </label>
            <AvatarInput
              type="file"
              id="avatar-upload"
              onChange={handleAvatar}
            />
            <StyledTextField
              label="Username"
              name="username"
              variant="outlined"
            />
            <StyledTextField label="Email" name="email" variant="outlined" />
            <StyledTextField
              label="Password"
              name="password"
              type="password"
              variant="outlined"
            />
            <StyledButton type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : "Sign Up"}
            </StyledButton>
          </Form>
        </ItemBox>
      ) : (
        <StyledBox >
          <Typography variant="h4">Welcome back,</Typography>
          <Form onSubmit={handleLogin}>
            <StyledTextField label="Email" name="email" variant="outlined" />
            <StyledTextField
              label="Password"
              name="password"
              type="password"
              variant="outlined"
            />
            <StyledButton type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : "Sign In"}
            </StyledButton>
          </Form>
        </StyledBox>
      )}
    </StyledContainer>
  );
};

export default Login;
