import next, { GetStaticProps } from 'next';
import { useEffect, useState } from 'react';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { FiUser,FiCalendar } from 'react-icons/fi'
import Header from '../components/Header';
import Link from 'next/link';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({postsPagination}:HomeProps) {
   
  const [nextpage,setNexPage]=useState<string>(postsPagination.next_page)
  const [results,setResults]=useState<Post[]>(postsPagination.results)
  

  // updating date from post
  const postsUpdatedDate = results.map(post=>{
    const first_publication_date = format(new Date(post.first_publication_date), 'dd MMM YYY',{
      locale:ptBR
    })

     return {...post,first_publication_date}
  })

  const [posts,setPosts]=useState<Post[]>(postsUpdatedDate)
  const [currentPage, setCurrentPage]= useState(1)  

  async function handleGetPosts():Promise<void>{
      if(!nextpage){
        return ;
      }
    
      const postResponses = await fetch(`${nextpage}`).then((res)=>{                
        return res.json()        
      })
     
      setNexPage(postResponses.next_page)
      setCurrentPage(postResponses.page)
      //setResults(postResponses.results)

      const postsUpdatedDate = postResponses.results.map(post=>{
        return {
          uid:post.uid,
          first_publication_date:format(new Date(post.first_publication_date), 'dd MMM YYY',{
            locale:ptBR
          }), 
          data: {
            title: post.data.title,
            subtitle: post.data.subtitle,
            author: post.data.author,
          }
        }
            
      })
    
      setPosts([...posts,...postsUpdatedDate])    
      
  }

  return (
    <>
      <main className={commonStyles.container}>
          <Header/>
          <div className={styles.posts}>

            {
              posts.map((post)=>(
                <div key={post.uid}>
                    <Link href={`/post/${post.uid}`}>
                      <a className={styles.post} >
                        <strong>{post.data.title}</strong>
                        <p>{post.data.subtitle}</p>
                        <ul>
                          <li>
                            <FiCalendar/>
                            {post.first_publication_date}
                          </li>
                          <li>
                            <FiUser/>
                            {post.data.author}
                          </li>
                        </ul>
                      </a>                  
                    </Link>
                </div>
              ))
            } 
            
            {nextpage && 

            <button onClick={handleGetPosts}>
              Carregar mais posts
            </button>
            }
           
          </div>
          

      </main>
    </>
  )
}

export const getStaticProps:GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponses = await prismic.getByType('home',{
    pageSize:1,
  });
  // console.log(postsResponses)
  var arrPosts = []

  postsResponses.results.map((element)=>{
    
    const post = {
      uid: element.uid,
      first_publication_date : element.first_publication_date,
      data:{
        title: element.data.title,
        subtitle: element.data.subtitle,
        author: element.data.author,
      }
    }
    arrPosts = [...arrPosts,post]
    
  }) 

  const postsPagination = {
    next_page: postsResponses.next_page,
    results: arrPosts
  } 

  return {
    props:{
      postsPagination
    },
  }
};
