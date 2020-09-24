import React, {useEffect, useState, KeyboardEvent} from 'react';
import { Card, CardDeck, Form} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import Columns from 'react-columns';
import { CountUp } from 'use-count-up'



function App() {

  const [latest, setLatest] = useState([]);
  const [results, setResults] = useState([]);
  const [searchCountries, setSearchCountries] = useState("");
  const [country, setCountry] = useState("");
  const [countryData, setcountryData] = useState("");
  const [dailyData, setDailyData] = useState([]);
  useEffect(()=> {
    axios
      .all([
      axios.get("https://corona.lmao.ninja/v3/covid-19/all"),
        axios.get("https://corona.lmao.ninja/v3/covid-19/countries"),
        axios.get("https://covid19.mathdro.id/api/daily")
      ])
      .then(responseArr => {
        setLatest(responseArr[0].data)
        setResults(responseArr[1].data)
        const modifiedData = responseArr[2].data.map((dailyData) => ({
          confirmed: dailyData.confirmed.total,
          deaths: dailyData.deaths.total,
          date: dailyData.reportDate,
        }));
        setDailyData(modifiedData);
        console.log(JSON.stringify(responseArr[2].data))
      })
      .catch(error => {
        console.log(error);
      })
  },[]);

  const date = new Date(parseInt(latest.updated));
  const lastUpdated = date.toString();
  const handleCountryChange = async (country) => {
    await axios.get(`https://corona.lmao.ninja/v3/covid-19/countries/${country}`)
      .then(res => {
        setcountryData(res.data)
        setCountry(country)
      })
    };

  const filterCountry = results.filter(item => {
    return searchCountries.toLowerCase() !== "" ? item.country.toLowerCase().includes(searchCountries.toLowerCase()) : item;
  })
  const lineChart = dailyData[0] ? (
    <div className='container'>
    <Line
      data={{
        labels: dailyData.map(({ date }) => date),
        datasets: [
          {
            data: dailyData.map((data) => data.confirmed),
            label: 'Infected',
            borderColor: '#3333ff',
            fill: true,
          },
          {
            data: dailyData.map((data) => data.deaths),
            label: 'Deaths',
            borderColor: 'red',
            backgroundColor: 'rgba(255, 0, 0, 0.5)',
            fill: true,
          },
        ],
      }}
    />
    </div>
  ) : null;

  const countries = filterCountry.map((data, key) => {
    return (
      <Card key={key} bg="light" text="dark" className="text-center" style={{ margin: 10 }}>
        <Card.Img variant="top" src={data.countryInfo.flag} />
        <Card.Body>
          <Card.Title>{data.country}</Card.Title>
          <Card.Text>
            Cases {data.cases}
          </Card.Text>
          <Card.Text>
            Deaths {data.deaths}
          </Card.Text>
          <Card.Text>
            Recovered {data.recovered}
          </Card.Text>
          <Card.Text>
            Today's cases {data.todayCases}
          </Card.Text>
          <Card.Text>
            Today's deaths {data.todayDeaths}
          </Card.Text>
          <Card.Text>
            Active {data.active}
          </Card.Text>
          <Card.Text>
            Critical {data.critical}
          </Card.Text>
        </Card.Body>
      </Card>
    )
  });
  var queries = [{
    columns: 2,
    query: 'min-width: 500px'
  }, {
    columns: 3,
    query: 'min-width: 1000px'
  }];
  return (
    <div>
      <br />
      <h2 className="text-center">Covid-19 Live Stats</h2>
      <br />
      <CardDeck style={{margin: 10}}>
        <Card bg="secondary" text="white" className="text-center" style={{margin:10}}>
          <Card.Body>
            <Card.Title>Cases</Card.Title>
            <Card.Text>
              <CountUp isCounting end={latest.cases} thousandsSeparator="," duration={2.5} />
              {/* {latest.cases} */}
      </Card.Text>
          </Card.Body>
          <Card.Footer>
            <small>Last updated {lastUpdated}</small>
          </Card.Footer>
        </Card>
        <Card bg="danger" text="white" className="text-center" style={{margin:10}}>
          <Card.Body>
            <Card.Title>Deaths</Card.Title>
            <Card.Text>
              <CountUp isCounting end={latest.deaths} thousandsSeparator="," duration={2.5} />
              {/* {latest.deaths} */}
            </Card.Text>
          </Card.Body>
          <Card.Footer>
            <small>Last updated {lastUpdated}</small>
          </Card.Footer>
        </Card>
        <Card bg="success" text="white" className="text-center" style={{margin:10}}>
          <Card.Body>
            <Card.Title>Recovered</Card.Title>
            <Card.Text>
              <CountUp isCounting end={latest.recovered} thousandsSeparator="," duration={2.5} />
              {/* {latest.recovered} */}
      </Card.Text>
          </Card.Body>
          <Card.Footer>
            <small>Last updated {lastUpdated}</small>
          </Card.Footer>
        </Card>
      </CardDeck>
      {lineChart}
      <Form  style={{ margin: 10 }} onSubmit={event => event.preventDefault()}>
        <Form.Group controlId="formGroupSearch">
          <Form.Control value = {searchCountries} type="text" placeholder="Search a country" onChange={e => setSearchCountries(e.target.value)}/>
        </Form.Group>
      </Form>

      <Columns queries={queries}>{countries}</Columns>

    </div>
  );
}

export default App;
