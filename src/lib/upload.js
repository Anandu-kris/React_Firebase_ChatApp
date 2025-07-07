import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "./firebase";

const upload = async (file) => {
  console.log("File being uploaded: ", file);
  if (!file) {
    throw new Error("No file provided for upload.");
  }
  const date = new Date();
  const timestamp = date.getTime();

  console.log("Firebase storage instance: ", storage);
  console.log("Storage reference path: ", `images/${timestamp}-${file.name}`);

  const storageRef = ref(storage, `images/${timestamp}-${file.name}`);

  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
      },
      (error) => {
        reject("Something went wrong!" + error.code);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          resolve(downloadURL);
        });
      }
    );
  });
};

export default upload;
