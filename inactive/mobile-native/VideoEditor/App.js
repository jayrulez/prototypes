import React from 'react'
import { StyleSheet, View } from 'react-native'
import Editor from './app/editor'

export default class App extends React.Component {
  render () {
    return (
      <View style={styles.container}>
        <Editor />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
})
