import type { NextPage } from 'next';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { RichTextEditor } from '@/components';
import axios from 'axios';
import style from '@/styles/create.module.scss';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Calendar, Title } from '@/components';
import { useStore } from '@/store';
import { MainLayout } from '@/layout';
import { useRouter } from 'next/router';
import ReactLoading from 'react-loading';
import Image from 'next/image';

interface ArticleList {
  ArticleId: string;
  title: string;
  createdAt: string;
  contents: string;
}

const Home: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const setTitle = useStore((state) => state.setTitle);
  const setCreatedAt = useStore((state) => state.setCreatedAt);
  const setContents = useStore((state) => state.setContents);

  const ListArticleHandler = useCallback(async () => {
    try {
      const { data } = await axios.get<ArticleList>(`http://127.0.0.1:4000/article/${id}`);
      const { title, createdAt, contents } = data;
      const parsedContents = JSON.parse(contents);
      setTitle(title);
      setCreatedAt(createdAt);
      setContents(parsedContents);
    } catch (error) {
      console.log(error);
    }
  }, [id, setContents, setCreatedAt, setTitle]);

  useEffect(() => {
    id && ListArticleHandler();

    return () => {
      setTitle(null);
      setCreatedAt(null);
      setContents(null);
    };
  }, [id, setTitle, setCreatedAt, setContents, ListArticleHandler]);

  // console.log(data);
  const validationSchema = Yup.object({
    title: Yup.string().required('Required'),
  });

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
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
  const [value, setValue] = useState('');
  const onChangeInputFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setValue('');
      uploadImage(e.target.files[0]);
    }
  };

  const uploadImage = async (imgData: Blob) => {
    const params = new FormData();
    params.append('file', imgData);
    try {
      const { data } = await axios.post('http://127.0.0.1:4000/registerImage', params, {
        headers: {
          'content-type': 'multipart/form-data',
        },
      });
      console.log(data);
    } catch (e) {
      console.log(e);
    }
  };

  const title = useStore((state) => state.title);
  const createdAt = useStore((state) => state.createdAt);
  const contents = useStore((state) => state.contents);

  const updateHandler = async () => {
    try {
      const { data } = await axios.post(`http://127.0.0.1:4000/update/${id}`, {
        title,
        createdAt,
        contents: JSON.stringify(contents),
      });

      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <MainLayout>
      <div className={style.create_main_wrapper} id='main_container'>
        <div className={style.tool_box_wrapper}>
          <div className={style.update_button_wrapper} onClick={() => updateHandler()}>
            <div className={style.update_button}>更新する</div>
          </div>
        </div>
        <div className={style.create_container}>
          <Title />

          <div className={style.input_file_wrapper}>
            <label htmlFor='img_file' className={style.label}>
              サムネイル
            </label>
            <div className={style.input_file_container}>
              <input
                name='img_file'
                type='file'
                ref={fileInputRef}
                className={style.file_input}
                onChange={onChangeInputFile}
              />
              <button className={style.input_file_text} onClick={() => FileInputHandler()}>
                ファイルを選択する
              </button>
            </div>
            {value && (
              <Image
                src={value}
                alt='alt'
                className={style.input_file_img}
                width={`300`}
                height={`400`}
              />
            )}
          </div>

          <div className={style.created_at_wrapper}>
            <label htmlFor='createdAt' className={style.created_at_label}>
              投稿日
            </label>
            <Calendar />
          </div>

          {contents ? (
            <div className={style.contents_main_wrapper}>
              <RichTextEditor />
            </div>
          ) : (
            <div className={style.loading_wrapper}>
              <ReactLoading
                type={'cylon'}
                color={'rgb(48, 92, 150)'}
                height={'15%'}
                width={'15%'}
              />
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Home;
