import Vue from 'vue'
import VueRouter from 'vue-router'
import Store from '../store'

Vue.use(VueRouter)

const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location, onResolve, onReject) {
  if (onResolve || onReject)
    return originalPush.call(this, location, onResolve, onReject)
  return originalPush.call(this, location).catch((err) => {
    if (VueRouter.isNavigationFailure(err)) {
      // resolve err
      return err
    }
    // rethrow error
    return Promise.reject(err)
  })
}

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home'),
    meta: { roles: ['guest', 'student', 'admin', 'representative'] }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login'),
    meta: { roles: ['guest'] }
  },
  {
    path: '/reset/:token',
    name: 'Reset Password',
    component: () => import('../views/reset/ResetPassword'),
    meta: { roles: ['guest'] }
  },
  {
    path: '/admin',
    name: 'Admin',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/admin/Admin'),
    meta: { roles: ['admin'] }
  },
  {
    path: '/adminOffers',
    name: 'AdminOffers',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/admin/AdminOffers'),
    meta: { roles: ['admin'] }
  },
  {
    path: '/offers',
    name: 'Offers',
    component: () => import('../views/student/Offers'),
    meta: { roles: ['student'] }
  },
  {
    path: '/profile',
    name: 'Profile', component: () => import('../views/Profile'),
    meta: { roles: ['student', 'admin', 'representative'] }
  },
  {
    path: '/board',
    name: 'Board',
    component: () => import('../views/Board'),
    meta: { roles: ['student', 'admin', 'representative'] }
  },
  {
    path: '/planning',
    name: 'Planning', component: () => import('../views/Planning'),
    meta: { roles: ['student', 'admin', 'representative'] }
  },
  {
    path: '/studentWishes',
    name: 'StudentWishes',
    component: () => import('../views/student/StudentWishes'),
    meta: { roles: ['student'] }
  },
  {
    path: '/companyWishes',
    name: 'CompanyWishes',
    component: () => import('../views/company/CompanyWishes'),
    meta: { roles: ['representative'] }
  },
  {
    path: '/companyOffer',
    name: 'Company Offer',
    component: () => import('../views/company/OfferTable'),
    meta: { roles: ['representative'] }
  },
  {
    path: '/companyStudent',
    name: 'Company Student',
    component: () => import('../views/company/StudentTable'),
    meta: { roles: ['representative'] }
  },
  //The * route need to stay in the end of routes array
  {
    path: "*",
    name: "Not found",
    component: () => import('../views/404'),
    meta: { roles: ['guest', 'student', 'admin', 'representative'] }
  }
]

const router = new VueRouter({
  routes,
  mode: 'history'
})

router.beforeEach((to, from, next) => {

  let role = Store.getters['GET_AUTHENTICATED_STATUS'] ? Store.getters['GET_CURRENT_USER'].role : 'guest'

  if (to.meta.roles && to.meta.roles.includes(role)) {
    switch (role) {
      case 'admin':
        next()
        break
      case 'student':

        // Redirection vers la page de profil si le statut est invalide et qu'on vient de se connecter
        if (from.name === "Login"
          && Store.getters['GET_CURRENT_STUDENT'].status !== 'validated'
          && to.name !== "Profile") {
            
          next({ name: 'Profile' })
        }
        else {
          next()
        }
        break
      case 'representative':
        next()
        break
    }
    next()
  } else {
    if (role === 'guest') {
      next({ name: 'Login' })
    }
    else {
      switch (role) {

        case 'admin':
          next({ name: 'Admin' })
          break

        case 'student':
          if (Store.getters['GET_CURRENT_STUDENT'].status === 'validated') {
            next({ name: 'Offers' })
          }
          else {
            next({ name: 'Profile' })
          }
          break

        case 'representative':
          next({ name: 'Company Offer' })
          break
      }
    }
  }
})

export default router
