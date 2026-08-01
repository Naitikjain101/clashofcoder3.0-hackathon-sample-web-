import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal, Section } from "./space/Section";
import { FAQS } from "@/lib/config";

export function FAQ() {
  return (
    <Section id="faq" eyebrow="Comms" title="FAQs" backdrop="violet">
      <Reveal>
        <Accordion type="single" collapsible className="max-w-3xl space-y-3">
          {FAQS.map((f) => (
            <AccordionItem
              key={f.q}
              value={f.q}
              className="glass overflow-hidden rounded-2xl border-none px-5"
            >
              <AccordionTrigger className="min-h-[56px] text-left font-display text-base hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
      {/* TODO: replace placeholder answers with the organising team's confirmed policy. */}
    </Section>
  );
}