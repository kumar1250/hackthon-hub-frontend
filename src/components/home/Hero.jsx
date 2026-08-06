import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Button from "../../ui/Button";
import Badge from "../../ui/Badge";
import HeroOrb from "./HeroOrb";
import { fadeUp, staggerContainer } from "../../animations/variants";

export default function Hero({ event, tracksCount }) {
  return (
    <section className="relative overflow-hidden pt-16 pb-14 sm:pt-24 sm:pb-20">
      <HeroOrb />
      <motion.div
        variants={staggerContainer(0.1)}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-2xl"
      >
        <motion.div variants={fadeUp}>
          <Badge tone="cyan">
            {event.college} · {event.place}
          </Badge>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="mt-6 font-display text-5xl font-bold leading-[1.03] tracking-tight sm:text-6xl md:text-7xl"
        >
          <span className="text-gradient">{event.name}</span>
        </motion.h1>

        <motion.p variants={fadeUp} className="mt-5 max-w-xl text-base text-mist sm:text-lg">
          {event.tagline} — {event.subtitle}
        </motion.p>

        <motion.div variants={fadeUp} className="mt-6 flex flex-wrap gap-2">
          <Badge tone="purple">{tracksCount} tracks</Badge>
          <Badge tone="pink">
            {event.minTeamSize}–{event.maxTeamSize} members / team
          </Badge>
          <Badge tone="cyan">{event.dateLabel}</Badge>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Button as="a" href="/register" size="lg">
            Register your team <ArrowRight className="h-4 w-4" />
          </Button>
          <Button as={Link} to="/problem-statements" variant="secondary" size="lg">
            Browse problem statements
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}