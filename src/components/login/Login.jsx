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
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

// Styled Components
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
  gap: "10px",
});

const SignUpWrapper = styled(Box)({
  width: "100%",
  maxWidth: "400px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "16px",
  paddingBottom: "40px",
});

const FormWrapper = styled(Box)({
  width: "100%",
  maxWidth: "400px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "20px",
});

const Form = styled("form")({
  marginTop: "5px",
  display: "flex",
  flexDirection: "column",
  gap: "30px",
  width: "100%",
  maxWidth: "20rem", // Match all field widths
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
  width: "100%",
  marginBottom: "-10px",
  backgroundColor: "rgba(17, 25, 40, 0.9)",
  color: "white",
  alignContent: "center",
  borderRadius: "10px",
  "& .MuiInputBase-input": {
    color: "white",
    padding: "12px 10px",
    alignContent: "center",
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
    opacity: 0.25,
  },
});

const StyledButton = styled(Button)({
  width: "100%",
  fontSize: "small",
  padding: "8px",
  backgroundColor: "#1f8ef1",
  color: "white",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: 300,
  "&:disabled": {
    cursor: "not-allowed",
    backgroundColor: "#1f8ff19c",
  },
});

// Component
const Login = () => {
  const [avatar, setAvatar] = useState({ file: null, url: "" });
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

      await setDoc(doc(db, "userchats", res.user.uid), { chats: [] });

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
        <SignUpWrapper>
          <Typography variant="h6">Create an Account</Typography>
          <label
            htmlFor="avatar-upload"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar
              src={avatar.url || "./avatar.png"}
              sx={{
                width: 50,
                height: 50,
                cursor: "pointer",
                marginBottom: "4px",
              }}
            />
            <Typography variant="body2" align="center">
              Upload an image
            </Typography>
          </label>
          <AvatarInput type="file" id="avatar-upload" onChange={handleAvatar} />

          <Form onSubmit={handleRegister}>
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
        </SignUpWrapper>
      ) : (
        <FormWrapper>
          <Typography variant="h6">Welcome back,</Typography>
          <Form onSubmit={handleLogin}>
            <StyledTextField
              name="email"
              label="Email"
              placeholder="Enter your email"
              autoComplete="email"
              autoFocus
              fullWidth
              required
              type="email"
              variant="outlined"
            />
            <StyledTextField
              name="password"
              label="Password"
              placeholder="Enter your password"
              autoComplete="current-password"
              fullWidth
              required
              type={showPassword ? "text" : "password"}
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <span
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "-2px",
                      color: "white",
                    }}
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? (
                      <VisibilityOff sx={{ width: "20px", height: "20px" }} />
                    ) : (
                      <Visibility sx={{ width: "20px", height: "20px" }} />
                    )}
                  </span>
                ),
              }}
            />

            {/* Remember me & forgot password */}
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "14px",
                color: "white",
                mt: "2px",
              }}
            >
              <label
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <input type="checkbox" style={{ accentColor: "#1f8ef1" }} />
                Remember Me
              </label>
              <a href="#" style={{ color: "#bbb", fontSize: "13px" }}>
                Forgot Password?
              </a>
            </Box>

            <StyledButton type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : "Login"}
            </StyledButton>
          </Form>
        </FormWrapper>
      )}
    </StyledContainer>
  );
};

export default Login;
