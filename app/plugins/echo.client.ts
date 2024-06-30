import Echo from 'laravel-echo'
import type { Channel, ChannelAuthorizationCallback, Options } from 'pusher-js'
import Pusher from 'pusher-js'
import type { ChannelAuthorizationData } from 'pusher-js/types/src/core/auth/options'

declare global {
  interface Window {
    Echo: Echo
    Pusher: typeof Pusher
  }
}

const ECHO_BROADCASTER = 'reverb'
const ECHO_APP_KEY = '9iaau1cgc7iqdt6ee97m'
const ECHO_HOST = 'localhost'
const ECHO_PORT = 8080
const ECHO_AUTH_ENDPOINT = '/broadcasting/auth'

export default defineNuxtPlugin(() => {
  const sanctumFetch = useSanctumClient()

  const authorizer = (channel: Channel, _: Options) => {
    return {
      authorize: (socketId: string, callback: ChannelAuthorizationCallback) => {
        const payload = JSON.stringify({
          socket_id: socketId,
          channel_name: channel.name,
        })

        const options = {
          method: 'post',
          body: payload,
        }

        sanctumFetch(ECHO_AUTH_ENDPOINT, options)
          .then((response: ChannelAuthorizationData) => callback(null, response))
          .catch(error => callback(error, null))
      },
    }
  }

  window.Pusher = Pusher
  window.Echo = new Echo({
    broadcaster: ECHO_BROADCASTER,
    key: ECHO_APP_KEY,
    wsHost: ECHO_HOST,
    wsPort: ECHO_PORT,
    wssPort: ECHO_PORT,
    forceTLS: false,
    enabledTransports: ['ws'],
    authorizer,
  })

  console.log('Echo client initialized')

  return {
    provide: {
      echo: window.Echo,
    },
  }
})
