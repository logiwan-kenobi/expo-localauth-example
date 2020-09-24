import React from "react";
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { NativeRouter, Route, Switch } from "react-router-native";
import * as LocalAuthentication from "expo-local-authentication";
import * as SplashScreen from "expo-splash-screen";

const DeviceContext = React.createContext({} as DeviceDetailsContext);
const UserContext = React.createContext({} as iAuthContext);

interface DeviceDetailsContext {
  biometrics: boolean;
}

interface iAuthContext {
  user: User;
  setUser: (user: User) => void;
}

type User = {
  username: string;
  password: string;
};

export default function App() {
  const [isAppReady, setIsAppReady] = React.useState(false);
  const [biometrics, setBiometrics] = React.useState(false);

  async function handleAppLoad() {
    // checks device to see if it has biometric hardware
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (compatible) {
      const records = await LocalAuthentication.isEnrolledAsync();

      if (records) {
        setBiometrics(true);
      }
    }

    // maybe get resources like fonts and w/e here

    setTimeout(async () => {
      setIsAppReady(true);
      await SplashScreen.hideAsync();
    }, 2000);
  }

  React.useEffect(() => {
    try {
      stopSplashScreen();
    } catch (e) {
      console.warn(e);
    }

    async function stopSplashScreen() {
      await SplashScreen.preventAutoHideAsync();
      await handleAppLoad();
    }
  }, []);

  if (!isAppReady) {
    return <View style={styles.container} />;
  }

  return (
    <DeviceContext.Provider value={{ biometrics }}>
      <AppAuth />
    </DeviceContext.Provider>
  );
}

function AppAuth() {
  const [user, setUser] = React.useState<User | null>();
  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Router />
    </UserContext.Provider>
  );
}

function Router() {
  const { user } = React.useContext(UserContext);

  if (user) {
    return (
      <NativeRouter>
        <Switch>
          <Route exact path="/" component={HomeScreen} />
        </Switch>
      </NativeRouter>
    );
  } else {
    return <LoginScreen />;
  }
}

function LoginScreen() {
  const { biometrics } = React.useContext(DeviceContext);
  const { setUser } = React.useContext(UserContext);
  const [useBiometricLogin, setUseBiometricLogin] = React.useState(biometrics);

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  React.useEffect(() => {
    console.log(useBiometricLogin);
    if (useBiometricLogin) {
      handleBiometricLogin();
    }

    async function handleBiometricLogin() {
      const result: LocalAuthentication.LocalAuthenticationResult = await LocalAuthentication.authenticateAsync(
        {
          promptMessage: "Login to My Test App",
        }
      );

      if (result.success === true) {
        setUser({ username: "test", password: "test" });
      } else if (result.error === "user_cancel") {
        setUseBiometricLogin(false);
      }
    }
  }, [biometrics, useBiometricLogin, setUseBiometricLogin]);

  function handleInputLogin() {
    setUser({ username, password });
  }

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Login to App</Text>
      <View style={{ marginTop: 40, width: "70%" }}>
        <TextInput
          value={username}
          onChangeText={(text) => setUsername(text)}
          placeholder="username"
          style={{
            backgroundColor: "#e2e2e2",
            padding: 10,
            borderRadius: 3,
            fontSize: 16,
            height: 44,
          }}
        />
        <View style={{ marginTop: 20, position: "relative", height: 44 }}>
          <TextInput
            placeholder="password"
            onChangeText={(text) => setPassword(text)}
            secureTextEntry
            style={{
              backgroundColor: "#e2e2e2",
              padding: 10,
              borderRadius: 3,
              fontSize: 16,
              height: 44,
            }}
          />
          {biometrics && (
            <TouchableOpacity
              onPress={() => setUseBiometricLogin(true)}
              style={{ position: "absolute", top: 7, right: 10 }}
            >
              <Image
                source={require("./assets/touch-id.png")}
                style={{
                  height: 30,
                  width: 30,
                  zIndex: 100,
                }}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <TouchableOpacity
        onPress={() => handleInputLogin()}
        style={{
          padding: 15,
          width: "70%",
          backgroundColor: "#009688",
          borderRadius: 3,
          justifyContent: "center",
          alignItems: "center",
          marginTop: 40,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "500" }}>
          Log in
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function HomeScreen() {
  const { setUser } = React.useContext(UserContext);
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 20,
        }}
      >
        <Text style={{ fontSize: 22 }}>Home</Text>
        <View
          style={{
            marginTop: 20,
            width: "100%",
            borderRadius: 10,
            backgroundColor: "#009688",
            padding: 30,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 32, fontWeight: "600" }}>
            Welcome Back!
          </Text>
          <Text style={{ color: "#fff", fontSize: 16, marginTop: 5 }}>
            Here's your dashboard
          </Text>
        </View>
        <View style={{ marginTop: 30 }}>
          <Text>Here is some content</Text>

          <TouchableOpacity
            onPress={() => setUser(null)}
            style={{
              width: "100%",
              marginTop: 200,
              borderRadius: 3,
              backgroundColor: "red",
              padding: 15,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 16 }}>Log out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
