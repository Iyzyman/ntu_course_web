// Generouted, changes to this file will be overriden
/* eslint-disable */

import { components, hooks, utils } from '@generouted/react-router/client'

export type Path =
  | `/`
  | `/:username`
  | `/:username/*`
  | `/:username/list/:slug`
  | `/:username/collections/:slug`
  | `/course`
  | `/course/:slug`
  | `/course/:slug/:category`
  | `/discover`
  | `/discover/:category`
  | `/discover/:category/:slug`
  | `/search`
  | `/search/:category`
  | `/trending`
  | `/trending/:period`

export type Params = {
  '/:username': { username: string }
  '/:username/*': { username: string; '*': string }
  '/:username/list/:slug': { username: string; slug: string }
  '/:username/collections/:slug': { username: string; slug: string }
  '/course/:slug': { slug: string }
  '/course/:slug/:category': { slug: string; category: string }
  '/discover/:category': { category: string }
  '/discover/:category/:slug': { category: string; slug: string }
  '/search/:category': { category: string }
  '/trending/:period': { period: string }
}

export type ModalPath = never

export const { Link, Navigate } = components<Path, Params>()
export const { useModals, useNavigate, useParams } = hooks<
  Path,
  Params,
  ModalPath
>()
export const { redirect } = utils<Path, Params>()
