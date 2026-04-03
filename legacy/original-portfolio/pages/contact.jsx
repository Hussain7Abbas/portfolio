import { useState } from 'react';
import ContactCode from '/components/ContactCode';
import styles from '/styles/ContactPage.module.css';
import toast from 'react-hot-toast';
import BlurFade from '/components/magicui/blur-fade';

const ContactPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const submitForm = async (e) => {
    e.preventDefault();
    console.log(process.env.NEXT_PUBLIC_API_URL);
    setIsLoading(true);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact`, {
      method: 'POST',
      body: JSON.stringify({ name, email, subject, message }),
    });
    if (res.ok) {
      toast.success("Your response has been received!", { id: "general_toast" });
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } else {
      toast.error("There was an error. Please try again in a while.", { id: "general_toast" });
    }
    setIsLoading(false);
  };

  return (
    <div className={styles.container}>
      <div>
        <BlurFade inView>
          <h3 className='text-2xl mb-3'>Reach Out Via Socials</h3>
        </BlurFade>
        <ContactCode />
      </div>
      <div>
        <BlurFade delay={0.25} inView>
          <h3 className={styles.heading}>Or Fill Out This Form</h3>
        </BlurFade>
        <form className={styles.form} onSubmit={submitForm}>
          <div className={styles.flex}>
            <div>
              <label htmlFor="name">Name</label>
              <input
                type="text"
                name="name"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="name">Subject</label>
            <input
              type="text"
              name="subject"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="message">Message</label>
            <textarea
              name="message"
              id="message"
              rows="5"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            ></textarea>
          </div>
          <button type="submit" disabled={isLoading}>Submit</button>
        </form>
      </div>
    </div>
  );
};

export async function getStaticProps() {
  return {
    props: { title: 'Contact' },
  };
}

export default ContactPage;
