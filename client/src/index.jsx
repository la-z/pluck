import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import ReactDOM from 'react-dom';
import NavBar from './components/Nav.jsx';
import UserProfile from './components/UserProfile.jsx';
import ZipCode from './components/Zip-code.jsx';
import './index.css';
import PlantList from './components/PlantList.jsx';
import UserLogin from './components/UserLogin.jsx';
import ViewPlantProfile from './components/ViewPlantProfile.jsx';
import CreatePlantProfile from './components/CreatePlantProfile.jsx';
import MyProfile from './components/myProfile.jsx';
import MapView from './components/MapView.jsx';
import SampleData from "./components/SampleData";
import axios from 'axios';
 

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      plants: [],
      username: '',
      zipcode: '',
      userId: '',
      userPlants: [],
    };

    // bind to this all functions being handed down
    this.zipCodeSubmit = this.zipCodeSubmit.bind(this);
    this.userLogin = this.userLogin.bind(this);
  }

  componentDidMount() {
    this.forceUpdate(); // rerenders page when components state or props change
  }

  // function gets called when submit button is clicked in zipcode view
  zipCodeSubmit(userZip) {
    // get req to server
    axios.get(`/user/zipcode?zipcode=${userZip.zipcode}`)
    // server will grab plants in this zipcode from db and send back
      .then((res) => {
        console.log(res.data);
        // data state in index component will be updated to those plants
        this.setState({
          plants: res.data,
        }); // method to redirect as second argument
      })
      .catch((err) => { console.log(err); });
  }

  // called in UserProfile when a user signs up/ hits submit button
  submitUserInfo(userInfo) {
    // get all user info from userProfile view
    // deconstruct vals
    const {
      username,
      password,
      address,
      zipcode,
    } = userInfo;
    // send post req to server to add new user to db
    axios.post('/user/info', {
      username,
      password,
      address,
      zipcode,
    })
      .then((res) => {
        console.log(res.data, 'RES DATA');
        // get all plants in new users zipcode
        this.zipCodeSubmit({ zipcode });
      })
      .catch((err) => { console.log(err); });
  }

  // called in UserLogin to allow user to log in when submit is pressed
  userLogin(userInfo) {
    // grab username and add to state
    this.setState({
      username: userInfo.username,
    });
    // get req to server to grab all user info
    axios.get(`/user/login?username=${userInfo.username}&password=${userInfo.password}`)
      .then((res) => {
        // set states with all user info
        this.setState({
          userId: res.data.id,
          zipcode: res.data.zipcode,
          userPlants: res.data.plants,
        });

        // get all plants in new users zipcode
        this.zipCodeSubmit({ zipcode: this.state.zipcode });
      })
      .catch((err) => { console.log(err); });
  }


  render() {
    return (

      <div>
        <BrowserRouter>
          <div>

            <NavBar logUser={this.userLoginLogut} signUser={this.userSignUp} />
            <Switch>
              <Route path="/" render={() => <ZipCode onSubmit={this.zipCodeSubmit} />} exact />
              <Route path="/userProfile" render={() => <UserProfile plants={this.state.plants} onSubmit={this.submitUserInfo} />} />
              <Route path="/plantList" render={() => <PlantList plants={this.state.plants} />} />
              <Route path="/userLogin" render={() => <UserLogin plants={this.state.plants} zipcode={this.state.zipcode} onSubmit={this.userLogin} />} />
              <Route path="viewPlantProfile" render={() => <ViewPlantProfile userId={this.state.userId} />} />
              <Route path="/submitPlant" render={() => <CreatePlantProfile userId={this.state.userId} username={this.state.username} />} />
              <Route path="/myProfile" render={() => <MyProfile zipcode={this.state.zipcode} plants={this.state.userPlants} username={this.state.username} />} />
              <Route path="/plantLocation" component={MapView} />
              <Route component={Error} />
            </Switch>
          </div>
        </BrowserRouter>
      </div>

    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
