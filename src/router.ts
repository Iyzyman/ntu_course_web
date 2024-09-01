// Generouted, changes to this file will be overriden
/* eslint-disable */

import { components, hooks, utils } from '@generouted/react-router/client'

export type Path =
  | `/`
  | `/:username`
  | `/:username/*`
  | `/:username/list/:slug`
  | `/author`
  | `/author/:slug`
  | `/author/:slug/:category`
  | `/book`
  | `/book/:slug`
  | `/book/:slug/:category`
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
  '/author/:slug': { slug: string }
  '/author/:slug/:category': { slug: string; category: string }
  '/book/:slug': { slug: string }
  '/book/:slug/:category': { slug: string; category: string }
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
