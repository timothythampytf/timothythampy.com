// Edit these in one place. Leave a link empty ("") to hide it.
window.SITE = {
  email: "timothythampy@gmail.com",
  links: {
    spotify: "https://open.spotify.com/artist/516N84Zm8jTFBAIDSK3uLK",
    "apple music": "https://music.apple.com/us/artist/timothy-thampy/1651133962",
    youtube: "https://www.youtube.com/@timothythampy",
    instagram: "https://www.instagram.com/timothythampy/",
    x: "https://x.com/timothythampy",
  },
  creditsPlaylist: "https://open.spotify.com/playlist/4IcAhkflAIH94HQIM6VDLl",
  // Playlist songs the daily sync leaves off the site.
  creditsIgnore: [
    "5XKZeNahjRUcFtDkXKalZw", // 5 o clock (ep version): same song as the single
  ],

  // Side A: records produced for other artists, shown on the home page in this order.
  selected: [
    "2PvoucU5Pm9SeLN9neuJpX", // Parchhaiyan
    "15Z1xuTPQjErBcsaFpunGg", // Yeh Duniya Jala Do
    "0blM9YkjL82jrhF8sd9pup", // Nahi
    "7JhBRChdbGS6sJVpNpRYFQ", // thunderstorms by the pool
    "5nBvkAMnwgWb2yUTNFkQfI", // Ab Na Laut Paayenge
    "0FXMgqU9FgWTPO7HikTmPB", // Tu Hai
    "6zdf7rE50ldtl4HSCXZMyn", // usey pata bhi nahi
    "4hckLrzyRR4iRZB6HJhVCF", // Shaam
    "7nrRAfitUbrhYjdbCwFDgl", // Aasaan nahi
    "36T00kmtpePZFPjNN4v7QO", // Kaagaz Ke Phool
  ],
  // Optional one-line notes under a title.
  notes: {
    "2PvoucU5Pm9SeLN9neuJpX": "talkhiyaan · sony music india",
    "5nBvkAMnwgWb2yUTNFkQfI": "talkhiyaan · sony music india",
  },

  // Mailing list for the new release (Kit, kit.com). Paste the form's ID to switch it on;
  // until then the signup only shows in the local preview.
  signup: { formId: "10024730" },

  // Side B: your own songs, newest first. The first one is shown by default.
  own: [
    { title: "", kind: "new · soon", image: "assets/photos/blur-soft.jpg" }, // unannounced: shown scrambled
    { title: "songs for nora", kind: "ep · 2023 · 4 songs", play: "album:6CTvqSSrEKH9Ew65L4Reo3", image: "assets/photos/sfn-cover.jpg" },
    { title: "5 o clock", kind: "single · 2023", play: "5QEpxX8kBJ7N4l3kijhand", image: "assets/covers/5QEpxX8kBJ7N4l3kijhand.jpg" },
  ],

  // YouTube video IDs.
  videos: [
    { id: "QKcLGOggorU", title: "parchhaiyan", by: "janisht joshi, phosphenes" },
    { id: "txLdwUxCbAo", title: "5 o clock", by: "timothy thampy" },
    { id: "9tlgRdap8Uc", title: "yeh duniya jala do", by: "janisht joshi" },
    { id: "DKgiLPkfyLA", title: "nahi", by: "janisht joshi" },
    { id: "BwfY6aeIVSE", title: "how i produced nahi", by: "in the studio" },
  ],

  // Liner notes: collaborators listed under "has made records with" are taken from
  // the credits, except anyone named here.
  hideFromNotes: [],

  // The contact sheet.
  photos: [
    "assets/photos/drums.jpg",
    "assets/photos/city-silhouette.jpg",
    "assets/photos/kitchen-guitar.jpg",
    "assets/photos/blur-face.jpg",
    "assets/photos/sun-silhouette.jpg",
    "assets/photos/floor-guitar.jpg",
    "assets/photos/bw-portrait.jpg",
  ],

  // The home page changes with the time in Mumbai.
  sky: {
    day: { photo: "assets/photos/sea-back.jpg", accent: "#a9c1ec" },
    dusk: { photo: "assets/photos/blur-motion.jpg", accent: "#e8a3cb" },
    night: { photo: "assets/photos/city-silhouette.jpg", accent: "#f3b462" },
  },
};
