import { request } from 'https';
import { GetStaticPaths, GetStaticProps } from 'next';
import Header from '../../components/Header';
import { FiCalendar,FiUser,FiClock } from "react-icons/fi";

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';
import  Head  from 'next/head';


interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({post}:PostProps):JSX.Element {

  const totalWords = post.data.content.reduce((total,contenItem)=>{
    total += contenItem.heading.split(' ').length;
    
    const words = contenItem.body.map(item => item.text.split(' ').length)

    words.map(word => {total += word})

    return total
  },0)

  const readTime = Math.ceil(totalWords / 200)

  const formatedDate = format(
    new Date(post.first_publication_date),
    'dd MM YYY',
    {
    locale:ptBR
    }
  )

  const router = useRouter()

  if(router.isFallback){
    return <h1>Carregando...</h1>
    
  }
 
  return (
    <>
      <Head>
        <title>{`${post.data.title} | Spacetraveling`}</title>
      </Head>

      <div className={commonStyles.container}>
          <Header/>
      </div>
      <div className={styles.logo}>
        <img src={post.data.banner.url} alt="logo" />
      </div> 
      <main className={commonStyles.container}>
        <header className={styles.header}>
            <strong>{post.data.title}</strong>
            <ul>          
              <li>
                  <FiCalendar/>
                  {formatedDate}
              </li>
              <li>
                  <FiUser/>
                  {post.data.author}
              </li>
              <li>
                  <FiClock/>
                  {`${readTime} min`}
              </li>
            </ul>
            <p>* editado em 19 mar 2021, às 15:49</p>
        </header>
        <section className={styles.content}>
          {post.data.content.map(content =>{
            return (
              <>
                  <strong key={content.heading}>{content.heading}</strong>
                  <div 
                    className={styles.postContent}
                    dangerouslySetInnerHTML={{__html:RichText.asHtml(content.body)}}
                  />
                  
            </>    
            )
          })}
          
        </section>
        <footer>
            <div className='styles.headerFooter'>
                <div>
                  <p>Como utilizar Hooks</p>
                  <p>Post anterior</p>
                </div>
                <div>
                  <p>Criando um app CRA do Zero</p>
                  <p>Próximo post</p>
                </div>
            </div>
            <div className={styles.formComentsFooter}>
                <form action="#"></form>
            </div>
        </footer>
      </main> 
    </>  
  )
}

export const getStaticPaths:GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('home')
  const paths = posts.results.map(post =>{
      return {
        params:{
          slug: post.uid,
        }
      }
  })  

  return {
    paths,
    fallback: true,
  }
};

export const getStaticProps:GetStaticProps = async ({params}) => {  
  const {slug} = params
  const prismic = getPrismicClient({});  
  const response = await prismic.getByUID('home',String(slug),{})
 
  console.log(response)

  const post = {
    uid:response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle:response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },      
      // content: {
      //   heading: response.data.content.heading ,
      //   body: {
      //     text: response.data.content.body.text ,
      //   }[],
      // }[],
      content: response.data.content.map((content)=>{
        return {
          heading:content.heading,
          body : [...content.body]
        }
      })
    },
  }
  return {
    props: {post}, // Will be passed to the page component as props
  }
};
