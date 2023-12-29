import { useSearchParams } from "react-router-dom"

const useSetParam= () =>{
    const [,setSearchParams] = useSearchParams();
    
    const setParam = (obj: {[x in string]:any}) => {
      setSearchParams(searchParams => {
          const urlSearchParams = new URLSearchParams(searchParams);
  
          for (const key in obj) {
            const value = obj[key];
            if(value != null){
              urlSearchParams.set(key, value.toString());
            }else{
              urlSearchParams.delete(key);
            }
          }
          
          return urlSearchParams;
      })
   };
  
   return setParam;
};

export default useSetParam;