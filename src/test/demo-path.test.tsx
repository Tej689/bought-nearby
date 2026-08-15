import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Compare } from '../screens/Compare'
import { Feed } from '../screens/Feed'
import { Log } from '../screens/Log'
import { Shelves } from '../screens/Shelves'
import { StoreDetail } from '../screens/StoreDetail'

/**
 * Walks the exact path the demo takes on stage. Typechecking catches none of
 * this — a bad hook order or a null deref only shows up when it renders.
 *
 * NearbyMap is deliberately excluded: Leaflet needs real layout metrics that
 * jsdom does not provide, so it is verified by hand on a device instead.
 */
function renderApp(initial = '/') {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <Routes>
        <Route path="/" element={<Feed />} />
        <Route path="/log" element={<Log />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/shelves" element={<Shelves />} />
        <Route path="/store/:storeId" element={<StoreDetail />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('feed', () => {
  it('renders friend activity with a rank sentence', async () => {
    renderApp('/')
    expect(await screen.findByText('Bought Nearby')).toBeInTheDocument()
    expect(screen.getByText('Top local store')).toBeInTheDocument()
    // "<name> ranked this #N of M in <Category>"
    expect(screen.getAllByText(/ranked this/i).length).toBeGreaterThan(3)
  })

  it('never shows your own purchases in the friend feed', () => {
    renderApp('/')
    const list = screen.getAllByRole('listitem')
    for (const li of list) {
      expect(within(li).queryByText(/^You$/)).not.toBeInTheDocument()
    }
  })
})

describe('shelves', () => {
  it('shows a ranked kitchen shelf with derived scores', async () => {
    renderApp('/shelves')
    expect(await screen.findByText('Your shelves')).toBeInTheDocument()
    expect(screen.getByText('Lodge cast iron skillet')).toBeInTheDocument()
    // The deep bucket is 7 items, so the header must say so.
    expect(screen.getByText(/Worth it · 7/)).toBeInTheDocument()
    expect(screen.getByText('10.0')).toBeInTheDocument()
  })

  it('switches categories', async () => {
    const user = userEvent.setup()
    renderApp('/shelves')
    await user.click(screen.getByRole('button', { name: /Tech/ }))
    expect(screen.getByText('AirPods Pro')).toBeInTheDocument()
    expect(screen.queryByText('Lodge cast iron skillet')).not.toBeInTheDocument()
  })
})

describe('store detail', () => {
  it('shows a rolled-up score and the items behind it', async () => {
    renderApp('/store/paragon')
    expect(await screen.findByText('Paragon Sports')).toBeInTheDocument()
    expect(screen.getByText(/Union Square · Local/)).toBeInTheDocument()
    expect(screen.getByText(/purchases logged here/)).toBeInTheDocument()
    expect(screen.getByText('Adjustable dumbbells')).toBeInTheDocument()
  })

  it('refuses to rank a chain and says why', async () => {
    renderApp('/store/target-atlantic')
    expect(await screen.findByText('Target')).toBeInTheDocument()
    expect(screen.getByText(/never ranked/i)).toBeInTheDocument()
  })
})

describe('log → compare → shelves', () => {
  it('logs an item, ranks it head-to-head, and lands it on the shelf', async () => {
    const user = userEvent.setup()
    renderApp('/log')

    await user.type(
      screen.getByPlaceholderText('Cast iron skillet'),
      'Copper saucepan',
    )
    await user.selectOptions(screen.getByRole('combobox'), 'whisk')
    await user.type(screen.getByPlaceholderText('0'), '78')
    await user.click(screen.getByRole('button', { name: /Worth it/ }))

    const submit = screen.getByRole('button', { name: 'Rank it' })
    expect(submit).toBeEnabled()
    await user.click(submit)

    // Kitchen/worth_it seeds 7 items, so binary insertion needs 3 answers.
    let rounds = 0
    while (screen.queryByText('Which one is better?')) {
      const choice = screen.queryByRole('button', { name: /Just bought/ })
      if (!choice) break
      await user.click(choice)
      if (++rounds > 6) throw new Error('comparison flow did not converge')
    }
    expect(rounds).toBe(3)

    // Always beating the pivot means it must land at #1.
    expect(await screen.findByText('Your shelves')).toBeInTheDocument()
    const rows = screen.getAllByRole('listitem')
    expect(within(rows[0]).getByText('Copper saucepan')).toBeInTheDocument()
    expect(within(rows[0]).getByText('10.0')).toBeInTheDocument()
    expect(screen.getByText(/Worth it · 8/)).toBeInTheDocument()
  })

  it('will not submit without a store and a sentiment', async () => {
    const user = userEvent.setup()
    renderApp('/log')
    await user.type(screen.getByPlaceholderText('Cast iron skillet'), 'Thing')
    expect(screen.getByRole('button', { name: 'Rank it' })).toBeDisabled()
  })

  it('bounces to the log screen if compare is opened with no draft', async () => {
    renderApp('/compare')
    expect(await screen.findByText('Log a purchase')).toBeInTheDocument()
  })
})
