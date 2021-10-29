import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useFormik } from "formik";
import * as Yup from "yup";
import { RichTextEditor } from "@/components";
import axios from "axios";
import style from "@/styles/create.module.scss";
import { InputHTMLAttributes, useRef, useState } from "react";
import { Calendar } from "@/components";
import { useStore } from "@/store";

const Home: NextPage = () => {
  const validationSchema = Yup.object({
    title: Yup.string().required("Required"),
  });

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
    validationSchema,
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
    },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const FileInputHandler = () => {
    fileInputRef.current && fileInputRef.current.click();
  };

  const [value, setValue] = useState("");
  const onChangeInputFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setValue("");
      uploadImage(e.target.files[0]);
    }
  };

  const uploadImage = async (imgData: Blob) => {
    const params = new FormData();
    params.append("file", imgData);
    try {
      const { data } = await axios.post("/go/registerImage", params, {
        headers: {
          "content-type": "multipart/form-data",
        },
      });
      console.log(data);
    } catch (e) {
      console.log(e);
    }
  };

  const title = useStore((state) => state.title);
  const setTitle = useStore((state) => state.setTitle);

  return (
    <div className={style.create_main_wrapper} id="main_container">
      <div className={style.create_container}>
        <div className={style.input_container}>
          <label htmlFor="main_title" className={style.label}>
            タイトル
          </label>
          <input
            type="text"
            id="main_title"
            className={style.input_box}
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              e.preventDefault();
              setTitle(e.target.value);
            }}
          />
        </div>

        <div className={style.input_file_wrapper}>
          <label htmlFor="img_file" className={style.label}>
            サムネイル
          </label>
          <div className={style.input_file_container}>
            <input
              name="img_file"
              type="file"
              ref={fileInputRef}
              className={style.file_input}
              onChange={onChangeInputFile}
            />
            <button
              className={style.input_file_text}
              onClick={() => FileInputHandler()}
            >
              ファイルを選択する
            </button>
          </div>
          {value && <img src={value} alt="" className={style.input_file_img} />}
        </div>

        <div className={style.created_at_wrapper}>
          <label htmlFor="">投稿日</label>
          <Calendar />
        </div>

        <div className={style.contents_main_wrapper}>
          <RichTextEditor />
        </div>
      </div>
    </div>
  );
};

export default Home;
