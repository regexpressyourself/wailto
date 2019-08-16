import {useState, useEffect} from 'react';

const useFetch = (url, options) => {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('sending fetch');
        console.log(url);
        const res = await fetch(url, options);
        const json = await res.json();
        console.log(json);
        setResponse(json);
      } catch (error) {
        setError(error);
      }
    };
    fetchData();
  }, []);
  return {response, error};
};

export { useFetch };
