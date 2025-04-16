import { Tag } from './tags';

export interface Restaurant {
  id: string;
  name: string;
  tagIds: string[];
  googleMapsLink: string;
  voteCount: number;
  dateAdded: string;
  imageUrl: string;
  weeklyVoteIncrease?: number;
  status: 'pending' | 'approved' | 'rejected';
}

export const restaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Dishoom',
    tagIds: ['covent-garden', 'indian', 'time-out', 'vegetarian'],
    googleMapsLink: 'https://goo.gl/maps/3dRFYaYBKtrBfkQH6',
    voteCount: 123,
    dateAdded: '2023-01-15',
    imageUrl: 'https://source.unsplash.com/random/300x200/?indian,food',
    weeklyVoteIncrease: 15,
  },
  {
    id: '2',
    name: 'Padella',
    tagIds: ['soho', 'italian', 'bib-gourmand'],
    googleMapsLink: 'https://goo.gl/maps/DLHsLFkHhgvJhR4V9',
    voteCount: 96,
    dateAdded: '2023-02-01',
    imageUrl: 'https://source.unsplash.com/random/300x200/?pasta,italian',
    weeklyVoteIncrease: 12,
  },
  {
    id: '3',
    name: 'Bancone',
    tagIds: ['covent-garden', 'italian', 'time-out'],
    googleMapsLink: 'https://goo.gl/maps/nZDXDQ8pDKjhW47S8',
    voteCount: 87,
    dateAdded: '2023-01-20',
    imageUrl: 'https://source.unsplash.com/random/300x200/?pasta',
    weeklyVoteIncrease: 10,
  },
  {
    id: '4',
    name: 'Bao',
    tagIds: ['soho', 'japanese', 'bib-gourmand'],
    googleMapsLink: 'https://goo.gl/maps/YcYDPWzYVfHSgQmw7',
    voteCount: 82,
    dateAdded: '2023-02-05',
    imageUrl: 'https://source.unsplash.com/random/300x200/?bao,asian',
    weeklyVoteIncrease: 8,
  },
  {
    id: '5',
    name: 'The Palomar',
    tagIds: ['soho', 'spanish', 'time-out'],
    googleMapsLink: 'https://goo.gl/maps/92YJ5rjGEzZ8SvZE9',
    voteCount: 79,
    dateAdded: '2023-01-25',
    imageUrl: 'https://source.unsplash.com/random/300x200/?mediterranean,food',
    weeklyVoteIncrease: 20,
  },
  {
    id: '6',
    name: 'Gloria',
    tagIds: ['shoreditch', 'italian', 'time-out'],
    googleMapsLink: 'https://goo.gl/maps/g2SWxrjyQZy5Lc1D7',
    voteCount: 75,
    dateAdded: '2023-02-10',
    imageUrl: 'https://source.unsplash.com/random/300x200/?italian,restaurant',
    weeklyVoteIncrease: 18,
  },
  {
    id: '7',
    name: 'Barrafina',
    tagIds: ['soho', 'spanish', 'michelin-star'],
    googleMapsLink: 'https://goo.gl/maps/hLbEkrw5z4t5WYGK8',
    voteCount: 70,
    dateAdded: '2023-01-18',
    imageUrl: 'https://source.unsplash.com/random/300x200/?spanish,tapas',
    weeklyVoteIncrease: 16,
  },
  {
    id: '8',
    name: 'Smoking Goat',
    tagIds: ['shoreditch', 'thai', 'time-out'],
    googleMapsLink: 'https://goo.gl/maps/ViP3dXRmv2n5JTJN7',
    voteCount: 68,
    dateAdded: '2023-02-15',
    imageUrl: 'https://source.unsplash.com/random/300x200/?thai,food',
    weeklyVoteIncrease: 14,
  },
  {
    id: '9',
    name: 'Koya',
    tagIds: ['soho', 'japanese', 'bib-gourmand', 'vegan'],
    googleMapsLink: 'https://goo.gl/maps/NfQzKMCz8CuJ1pZF9',
    voteCount: 65,
    dateAdded: '2023-01-22',
    imageUrl: 'https://source.unsplash.com/random/300x200/?japanese,noodles',
    weeklyVoteIncrease: 22,
  },
  {
    id: '10',
    name: 'Fallow',
    tagIds: ['mayfair', 'british', 'time-out', 'vegetarian'],
    googleMapsLink: 'https://goo.gl/maps/UQcHfH9zXZxjdYk88',
    voteCount: 62,
    dateAdded: '2023-02-20',
    imageUrl: 'https://source.unsplash.com/random/300x200/?sustainable,food',
    weeklyVoteIncrease: 25,
  },
  {
    id: '11',
    name: 'Hoppers',
    tagIds: ['soho', 'indian', 'time-out'],
    googleMapsLink: 'https://goo.gl/maps/9v5M3oJzHC6t3tQH6',
    voteCount: 58,
    dateAdded: '2023-01-28',
    imageUrl: 'https://source.unsplash.com/random/300x200/?srilanka,food',
    weeklyVoteIncrease: 13,
  },
  {
    id: '12',
    name: 'Kiln',
    tagIds: ['soho', 'thai', 'bib-gourmand'],
    googleMapsLink: 'https://goo.gl/maps/oe1xKzDHBJwn1BgK8',
    voteCount: 54,
    dateAdded: '2023-02-25',
    imageUrl: 'https://source.unsplash.com/random/300x200/?thai,cooking',
    weeklyVoteIncrease: 19,
  },
].map(restaurant => ({ ...restaurant, status: 'approved' }));

export const getTrendingRestaurants = (allRestaurants: Restaurant[], limit = 5) => {
  return [...allRestaurants]
    .sort((a, b) => (b.weeklyVoteIncrease || 0) - (a.weeklyVoteIncrease || 0))
    .slice(0, limit);
};
