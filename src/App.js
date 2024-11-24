import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import './App.css';

const Container = styled.main`
  max-width: 360px;
  margin: 30px auto;
  background: #1a1a2e;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
`;

const Title = styled.h1`
  text-align: center;
  color: #fff;
  margin: 0;
  font-size: 2.5rem;
  span {
    font-size: 1rem;
    vertical-align: top;
    display: inline-block;
    margin-top: 7px;
  }
`;

const Form = styled.form`
  margin-top: 20px;
  input {
    width: 100%;
    background-color: transparent;
    color: #ddd;
    border: 2px solid #30313d;
    padding: 10px;
    border-radius: 5px;
    margin-bottom: 10px;
    &:focus {
      border-color: #00aaff;
      outline: none;
    }
  }
  button {
    width: 100%;
    padding: 10px;
    border: 0;
    border-radius: 5px;
    background-color: #00aaff;
    color: #fff;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s;
    &:hover {
      background-color: #0088cc;
    }
  }
`;

const Transactions = styled.div`
  margin-top: 20px;
`;

const Transaction = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-top: 1px solid #30313d;
  &:first-child {
    border-top: 0;
  }
  .left {
    .name {
      font-size: 1rem;
      color: #fff;
    }
    .description {
      font-size: 0.7rem;
      color: #888;
    }
  }
  .right {
    text-align: right;
    .price {
      &.green {
        color: #1c1;
      }
      &.red {
        color: #c11;
      }
    }
    .date {
      font-size: 0.7rem;
      color: #888;
    }
  }
`;

function App() {
  const [name, setName] = useState('');
  const [datetime, setDatetime] = useState('');
  const [description, setDescription] = useState('');
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    getTransactions().then(setTransactions);
  }, []);

  async function getTransactions() {
    const url = process.env.REACT_APP_API_URL + '/transactions';
    const response = await fetch(url);
    return await response.json();
  }

  function addNewTransaction(ev) {
    ev.preventDefault();
    const url = process.env.REACT_APP_API_URL + '/transaction';
    const priceString = name.split(' ')[0];
    const price = parseFloat(priceString.replace(/[^\d.-]/g, '')); // Remove currency symbols and parse as number
    const transactionName = name.substring(priceString.length + 1);

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price,
        name: transactionName,
        datetime,
        description,
      }),
    })
      .then((response) => {
        response.json().then((json) => {
          setName('');
          setDatetime('');
          setDescription('');
          console.log('Server response', json);
          setTransactions((prev) => [...prev, json]); // Update transactions state
        });
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  let total = 0;
  transactions.forEach((transaction) => {
    total += transaction.price;
  });

  total = total.toFixed(2);
  const fraction = total.split('.')[1];
  total = total.split('.')[0];

  return (
    <Container>
      <Title>
        £{total}
        <span>{fraction}</span>
      </Title>

      <Form onSubmit={addNewTransaction}>
        <input
          type="text"
          value={name}
          onChange={(ev) => setName(ev.target.value)}
          placeholder={'+300 new smartphone'}
        />
        <input
          value={datetime}
          onChange={(ev) => setDatetime(ev.target.value)}
          type="datetime-local"
        />
        <input
          type="text"
          value={description}
          onChange={(ev) => setDescription(ev.target.value)}
          placeholder={'description'}
        />
        <button type="submit">Add transaction</button>
      </Form>

      <Transactions>
        {transactions.length > 0 &&
          transactions.map((transaction) => (
            <Transaction
              key={transaction._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="left">
                <div className="name">{transaction.name}</div>
                <div className="description">{transaction.description}</div>
              </div>
              <div className="right">
                <div className={`price ${transaction.price < 0 ? 'red' : 'green'}`}>
                  {transaction.price}
                </div>
                <div className="date">{transaction.datetime}</div>
              </div>
            </Transaction>
          ))}
      </Transactions>
    </Container>
  );
}

export default App;