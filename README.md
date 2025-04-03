# React Native with xState

**This is an opinionated guide on how to orchestrate your React Native application with xState.**

It is described in the following series:

:one: [Initial project setup](https://dev.to/gtodorov/react-native-with-xstate-v5-4ekn)  
:two: [Navigation optimizations](https://dev.to/gtodorov/improve-react-navigation-with-xstate-v5-2l15)  
:three: [Notification center](https://dev.to/gtodorov/react-native-notification-center-with-xstate-v5-41cf)  
:four: [Authentication](https://dev.to/gtodorov/react-native-authentication-with-xstate-v5-39ah)  
:five: [Onboarding](https://dev.to/gtodorov/react-native-onboarding-wizard-with-xstate-v5-1naf)

## Basic architecture

<head>
  <link
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
  rel="stylesheet"
  />
</head>

```mermaid
flowchart TB
    subgraph wrapper[" "]
        direction TB
        subgraph Root
            direction LR
            NavRef("fa:fa-cogs Navigation Ref") ---> AppM("App Machine")
            NavRef("fa:fa-cogs Navigation Ref") ---> RootNav("fa:fa-code Root Navigator")
            AppM("fa:fa-cog App Machine") <--useApp--> RootNav("fa:fa-code Root Navigator")
        end
        subgraph authenticating
            direction LR
            MAuthenticating("fa:fa-cogs Machine") <--useNavigator--> NavAuthenticating("fa:fa-code Navigator")
        end
        subgraph authenticated
            direction LR
            MAuthenticated("fa:fa-cogs Machine") <--useNavigator--> NavAuthenticated("fa:fa-code Navigator")
        end
        subgraph List
            direction LR
            MList("fa:fa-cogs Machine") <--useSelector--> SList("fa:fa-code Screen")
        end
        subgraph Home
            direction LR
            MHome("fa:fa-cogs Machine") <--useSelector--> SHome("fa:fa-code Screen")
        end
        subgraph SignIn
            direction LR
            SScreen("fa:fa-code Screen")
        end
    end
    Root --authenticatingNavigatorRef--> authenticating
    Root --authenticatedNavigatorRef--> authenticated
    authenticating -.sendParent.-> Root
    authenticating --signInActorRef--> SignIn
    authenticated --homeActorRef--> Home
    authenticated --listActorRef--> List
```

## Working on the application

> **Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

### Step 1: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.

To start Metro, run the following command from the _root_ of your React Native project:

```bash
# using npm
npm start

# OR using Yarn
yarn start
```

### Step 2: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

#### For Android

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

#### For iOS

```bash
# using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up _correctly_, you should see your new app running in your _Android Emulator_ or _iOS Simulator_ shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.

### Step 3: Modifying your App

Now that you have successfully run the app, let's modify it.

1. Open `App.tsx` in your text editor of choice and edit some lines.
2. For **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Developer Menu** (<kbd>Ctrl</kbd> + <kbd>M</kbd> (on Window and Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (on macOS)) to see your changes!

   For **iOS**: Hit <kbd>Cmd ⌘</kbd> + <kbd>R</kbd> in your iOS Simulator to reload the app and see your changes!

### Congratulations

You've successfully run and modified your React Native App!
